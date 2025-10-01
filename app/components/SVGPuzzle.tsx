import { useMap } from "@mantine/hooks";
import type Konva from "konva";
import { useRef, useState } from "react";
import {
  type KonvaNodeEvents,
  Layer,
  Path,
  Stage,
  type StageProps,
} from "react-konva";
import { useImage } from "react-konva-utils";

import { usePuzzleSnap } from "~/helpers/puzzleSnap";

interface FillPatternOffset {
  x?: number;
  y?: number;
}

interface SVGPuzzleProps extends StageProps {
  svgData: string;
  width: number;
  height: number;
  hardcodedFillPatternOffsets: Record<string, FillPatternOffset>;
  debugSnapOverlay?: boolean;
  scaleMultiplier?: number;
}

interface DragGroupState {
  leaderId: string;
  leaderStart: { x: number; y: number };
  groupIds: string[];
  memberStarts: Record<string, { x: number; y: number }>;
}

interface ParsedPath {
  id: string;
  data: string;
  fill?: string;
  fillPatternSrc?: string;
  fillPatternTransform?: string;
  stroke?: string;
  strokeWidth?: number;
  transform: string | null;
}

interface ParsedSVGData {
  paths: ParsedPath[];
  patterns: Record<
    string,
    {
      href: string;
      transform?: string;
    }
  >;
  svgWidth: number;
  svgHeight: number;
}

const SVGPuzzle: FC<SVGPuzzleProps> = ({
  svgData,
  width,
  height,
  hardcodedFillPatternOffsets,
  debugSnapOverlay,
  ...otherProps
}) => {
  // Parse SVG and extract patterns and viewBox
  const { paths, svgWidth, svgHeight } = useMemo<ParsedSVGData>(() => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.visibility = "hidden";
    document.body.appendChild(container);
    container.innerHTML = svgData;
    const svgElement = container.querySelector("svg");
    invariant(svgElement, "Missing SVG element");

    // Extract viewBox dimensions
    const viewBoxSpec = svgElement.getAttribute("viewBox");
    invariant(viewBoxSpec, "Missing viewBox attribute");
    const viewBox = viewBoxSpec.split(" ") as [string, string, string, string];
    const svgWidth = parseFloat(viewBox[2]);
    const svgHeight = parseFloat(viewBox[3]);

    // Extract pattern definitions with transforms
    const patterns: Record<
      string,
      {
        href: string;
        transform?: string;
      }
    > = {};

    svgElement.querySelectorAll("pattern").forEach(pattern => {
      const id = pattern.getAttribute("id");
      const useElement = pattern.querySelector("use");
      const imageRef = useElement?.getAttribute("xlink:href");

      if (id && imageRef) {
        // Remove the "#" and find the actual image element
        const imageId = imageRef.substring(1);
        const imageElement = svgElement.querySelector(`image[id="${imageId}"]`);
        const href =
          imageElement?.getAttribute("xlink:href") ??
          imageElement?.getAttribute("href");

        if (href?.startsWith("data:")) {
          invariant(href, `Pattern ${id} missing image data`);
          patterns[id] = {
            href,
            transform: useElement?.getAttribute("transform") ?? undefined,
          };
        }
      }
    });

    const pathElements = svgElement.querySelectorAll("path");
    const paths = Array.from(pathElements).map<ParsedPath>(
      (pathElement, index) => {
        const data = pathElement.getAttribute("d");
        invariant(data, `Path ${index} missing 'd' attribute`);

        const fill = pathElement.getAttribute("fill") ?? undefined;
        const stroke = pathElement.getAttribute("stroke") ?? undefined;
        const strokeWidth = parseStrokeWidth(pathElement);
        const transform = pathElement.getAttribute("transform");

        let fillPatternSrc: string | undefined;
        let fillPatternTransform: string | undefined;
        if (fill?.startsWith("url(#")) {
          const patternId = fill.match(/url\(#([^)]+)\)/)?.[1];
          if (patternId && patterns[patternId]) {
            const pattern = patterns[patternId];
            fillPatternSrc = pattern.href;
            fillPatternTransform = pattern.transform;
          }
        }
        return {
          id: `path-${index}`,
          data,
          fill,
          stroke,
          strokeWidth,
          transform,
          fillPatternSrc,
          fillPatternTransform,
        };
      },
    );

    document.body.removeChild(container);
    return { paths, patterns, svgWidth, svgHeight };
  }, [svgData]);

  // Initialize path positions from parsed SVG data
  const pathPositions = useMap<string, { x: number; y: number }>();
  useEffect(() => {
    pathPositions.clear();
    paths.forEach(({ id }) => {
      pathPositions.set(id, { x: 0, y: 0 });
    });
  }, [paths]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scatter pieces randomly on mount (hidden-then-reveal)
  useEffect(() => {
    if (hasScatteredRef.current) {
      return;
    }
    const layer = layerRef.current;
    if (!layer) {
      return;
    }

    // ensure nodes are in the scene graph
    requestAnimationFrame(() => {
      const placedPieces: {
        x: number;
        y: number;
        width: number;
        height: number;
      }[] = [];

      // Helper to check if two rectangles overlap significantly
      const overlaps = (
        rect1: { x: number; y: number; width: number; height: number },
        rect2: { x: number; y: number; width: number; height: number },
      ) => {
        const overlapThreshold = 0.3; // 30% overlap is too much
        const dx = Math.abs(
          rect1.x + rect1.width / 2 - (rect2.x + rect2.width / 2),
        );
        const dy = Math.abs(
          rect1.y + rect1.height / 2 - (rect2.y + rect2.height / 2),
        );
        const overlapX = Math.max(0, (rect1.width + rect2.width) / 2 - dx);
        const overlapY = Math.max(0, (rect1.height + rect2.height) / 2 - dy);
        const overlapArea = overlapX * overlapY;
        const minArea = Math.min(
          rect1.width * rect1.height,
          rect2.width * rect2.height,
        );
        return overlapArea / minArea > overlapThreshold;
      };

      paths.forEach(({ id }) => {
        const node = layer.findOne(`.${id}`) as Konva.Node | null;
        if (!node) {
          return;
        }

        const rect = node.getClientRect({
          skipTransform: true,
          skipShadow: true,
        });
        const minX = 0;
        const maxX = svgWidth - rect.width;
        const minY = 0;
        const maxY = svgHeight - rect.height;

        if (maxX < minX || maxY < minY) return;

        // Try to find a non-overlapping position
        let x, y;
        let attempts = 0;
        let hasOverlap = true;

        do {
          x = minX + Math.random() * (maxX - minX);
          y = minY + Math.random() * (maxY - minY);

          const candidateRect = {
            x,
            y,
            width: rect.width,
            height: rect.height,
          };

          hasOverlap = placedPieces.some(placed =>
            overlaps(candidateRect, placed),
          );
          attempts++;
        } while (hasOverlap && attempts < 50);

        // Store the placed piece position
        placedPieces.push({
          x,
          y,
          width: rect.width,
          height: rect.height,
        });

        pathPositions.set(id, {
          x,
          y,
        });
      });

      hasScatteredRef.current = true;
      setIsInitialized(true);
    });
  }, [paths, svgWidth, svgHeight]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate aspect-ratio preserving scale and centering
  const { scale, offsetX, offsetY } = useMemo(() => {
    const scaleX = width / svgWidth;
    const scaleY = height / svgHeight;
    const uniformScale = Math.min(scaleX, scaleY);

    const scaledWidth = svgWidth * uniformScale;
    const scaledHeight = svgHeight * uniformScale;

    const offsetX = (width - scaledWidth) / 2;
    const offsetY = (height - scaledHeight) / 2;

    return { scale: uniformScale, offsetX, offsetY };
  }, [width, height, svgWidth, svgHeight]);

  // Puzzle snapping functionality
  const { arePiecesSnapped, map } = usePuzzleSnap(
    svgData,
    () => Object.fromEntries(pathPositions.entries()),
    () => scale,
  );

  // Drag group state
  const dragGroupRef = useRef<DragGroupState | null>(null);

  // Scatter initialization refs and state
  const layerRef = useRef<Konva.Layer>(null);
  const hasScatteredRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // BFS to collect connected component from map.neighbors
  const collectConnectedComponent = (startId: string): string[] => {
    const visited = new Set<string>();
    const queue = [startId];
    const component: string[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;

      visited.add(currentId);
      component.push(currentId);

      // Add all neighbors to queue
      const neighbors = map.neighbors[currentId] ?? [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          queue.push(neighborId);
        }
      }
    }

    return component;
  };

  const scaleMultiplier = 0.7;
  return (
    <Stage {...{ width, height }} {...otherProps}>
      <Layer
        ref={layerRef}
        opacity={isInitialized ? 1 : 0}
        scale={{ x: scale * scaleMultiplier, y: scale * scaleMultiplier }}
        offset={{ x: -offsetX / scale, y: -offsetY / scale }}
      >
        {paths.map(path => {
          const { x, y } = pathPositions.get(path.id) ?? {};
          const props: Konva.PathConfig & KonvaNodeEvents = {
            name: path.id,
            data: path.data,
            x,
            y,
            stroke: path.stroke,
            strokeWidth: path.strokeWidth,
            draggable: true,
            onDragEnd: ({ target }) => {
              document.body.style.cursor = "grab";

              // Commit positions for all group members
              if (dragGroupRef.current) {
                const { groupIds } = dragGroupRef.current;
                const layer = target.getLayer();

                for (const memberId of groupIds) {
                  const node = layer?.findOne(`.${memberId}`);
                  if (node) {
                    pathPositions.set(memberId, {
                      x: node.x(),
                      y: node.y(),
                    });
                  }
                }

                // Clear drag group state
                dragGroupRef.current = null;
              } else {
                // Fallback for non-group drags
                pathPositions.set(path.id, {
                  x: target.x(),
                  y: target.y(),
                });
              }
            },
            onClick: ({ target }) => {
              target.moveToTop();
            },
            onTap: ({ target }) => {
              target.moveToTop();
            },
            onMouseEnter: ({ target }) => {
              target.opacity(0.8);
              document.body.style.cursor = "grab";
            },
            onMouseLeave: ({ target }) => {
              target.opacity(1);
              document.body.style.cursor = "default";
            },
            onDragStart: evt => {
              document.body.style.cursor = "grabbing";

              // Collect connected component and cache positions
              const groupIds = collectConnectedComponent(path.id);
              const layer = evt.target.getLayer();
              const memberStarts: Record<string, { x: number; y: number }> = {};

              // Get current positions for all group members
              for (const memberId of groupIds) {
                const node = layer?.findOne(`.${memberId}`);
                if (node) {
                  memberStarts[memberId] = { x: node.x(), y: node.y() };
                }
              }

              // Store drag group state
              const leaderStart = memberStarts[path.id];
              if (leaderStart) {
                dragGroupRef.current = {
                  leaderId: path.id,
                  leaderStart,
                  groupIds,
                  memberStarts,
                };
              }
            },
            onDragMove: evt => {
              if (!dragGroupRef.current) return;

              const { leaderId, leaderStart, groupIds, memberStarts } =
                dragGroupRef.current;
              const layer = evt.target.getLayer();

              // Calculate delta from leader's movement
              const leaderCurrent = { x: evt.target.x(), y: evt.target.y() };
              const delta = {
                x: leaderCurrent.x - leaderStart.x,
                y: leaderCurrent.y - leaderStart.y,
              };

              // Apply delta to all group members (except leader)
              for (const memberId of groupIds) {
                if (memberId === leaderId) continue;

                const node = layer?.findOne(`.${memberId}`);
                if (node && memberStarts[memberId]) {
                  const memberStart = memberStarts[memberId];
                  if (memberStart) {
                    const newPos = {
                      x: memberStart.x + delta.x,
                      y: memberStart.y + delta.y,
                    };
                    node.position(newPos);
                  }
                }
              }

              // Batch draw for performance
              layer?.batchDraw();
            },
          };

          // Check if this piece is snapped with any neighbor
          const isSnapped =
            debugSnapOverlay &&
            Array.from(pathPositions.keys()).some(
              neighborId =>
                neighborId !== path.id &&
                arePiecesSnapped(path.id, neighborId, 8),
            );

          // Add snap styling to props if snapped
          const snapProps = isSnapped
            ? {
                shadowColor: "lime",
                shadowBlur: 4 / scale,
                shadowOffset: { x: 0, y: 0 },
                shadowOpacity: 1,
                skipShadow: true,
              }
            : {};

          return path.fillPatternSrc ? (
            <ImagePath
              key={path.id}
              {...props}
              {...snapProps}
              {...{ hardcodedFillPatternOffsets }}
              fillPatternSrc={path.fillPatternSrc}
              fillPatternTransform={path.fillPatternTransform}
            />
          ) : (
            <Path key={path.id} {...props} {...snapProps} fill={path.fill} />
          );
        })}
      </Layer>
    </Stage>
  );
};

export default SVGPuzzle;

const parseStrokeWidth = (pathElement: SVGPathElement): number | undefined => {
  const value = pathElement.getAttribute("stroke-width");
  if (value) {
    return parseFloat(value);
  }
};

interface ImagePathProps extends Omit<Konva.PathConfig, "fillPatternImage"> {
  hardcodedFillPatternOffsets: Record<string, FillPatternOffset>;
  fillPatternSrc: string;
  fillPatternTransform?: string;
}

const ImagePath: FC<ImagePathProps> = ({
  hardcodedFillPatternOffsets,
  fillPatternSrc,
  fillPatternTransform,
  ...otherProps
}) => {
  const ref = useRef<Konva.Path>(null);
  const [fillPatternImage] = useImage(fillPatternSrc);
  const { x, y } =
    typeof otherProps.name === "string"
      ? (hardcodedFillPatternOffsets[otherProps.name] ?? {})
      : { x: undefined, y: undefined };
  return (
    <Path
      {...{ ref, fillPatternImage }}
      {...svgTransform2KonvaTransformAttributes(
        ref.current,
        fillPatternTransform,
      )}
      fillPatternX={x}
      fillPatternY={y}
      {...otherProps}
    />
  );
};

const svgTransform2KonvaTransformAttributes = (
  path: Konva.Path | null,
  transform: string | undefined,
): Pick<Konva.PathConfig, "fillPatternScale" | "fillPatternOffset"> => {
  if (!transform || !path) {
    return {};
  }
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match) {
    throw new Error("Invalid transform string: " + transform);
  }
  const [scaleX, _skewY, _skewX, scaleY, translateX, translateY] = match[1]!
    .split(/[\s,]+/)
    .map(Number) as [number, number, number, number, number, number];
  const { width, height } = path.getClientRect({
    skipTransform: true,
    skipShadow: true,
  });
  return {
    fillPatternScale: {
      x: scaleX * width,
      y: scaleY * height,
    },
    fillPatternOffset: {
      x: translateX * width,
      y: translateY * height,
    },
  };
};
