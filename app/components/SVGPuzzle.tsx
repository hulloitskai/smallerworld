import { useMap } from "@mantine/hooks";
import type Konva from "konva";
import {
  type KonvaNodeEvents,
  Layer,
  Path,
  Stage,
  type StageProps,
} from "react-konva";
import { useImage } from "react-konva-utils";

import { usePuzzleSnap } from "~/helpers/svgPuzzle";

export interface FillPatternOffset {
  x?: number;
  y?: number;
}

interface SVGPuzzleProps extends StageProps {
  svgData: string;
  width: number;
  height: number;
  pathInitializers: Record<
    string,
    {
      initialPosition: { x: number; y: number };
      fillPatternOffset: FillPatternOffset;
    }
  >;
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
  pathInitializers,
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
  const initialPathPositions = useMemo(
    () =>
      Object.entries(pathInitializers).map<[string, { x: number; y: number }]>(
        ([id, { initialPosition }]) => [id, initialPosition],
      ),
    [pathInitializers],
  );
  const pathPositions = useMap<string, { x: number; y: number }>(
    initialPathPositions,
  );

  // Calculate aspect-ratio preserving scale and centering
  const { scale /*, offsetX, offsetY */ } = useMemo(() => {
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

  // Layer ref for auto-align functionality
  const layerRef = useRef<Konva.Layer>(null);

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

      // Add only SNAPPED neighbors to queue
      const neighbors = map.neighbors[currentId] ?? [];
      for (const neighborId of neighbors) {
        if (
          !visited.has(neighborId) &&
          arePiecesSnapped(currentId, neighborId, 8)
        ) {
          queue.push(neighborId);
        }
      }
    }

    return component;
  };

  // Auto-align pieces when they snap together
  const autoAlignSnappedPieces = (pieceId: string, layer: Konva.Layer) => {
    const neighbors = map.neighbors[pieceId] ?? [];
    const snappedNeighbors: string[] = [];

    // Find all snapped neighbors
    for (const neighborId of neighbors) {
      if (arePiecesSnapped(pieceId, neighborId, 8)) {
        snappedNeighbors.push(neighborId);
      }
    }

    if (snappedNeighbors.length === 0) return;

    // Calculate the aligned position based on snapped neighbors
    const currentPos = pathPositions.get(pieceId);
    if (!currentPos) return;

    // Get the first snapped neighbor's position (they should all be aligned)
    const neighborPos = pathPositions.get(snappedNeighbors[0]!);
    if (!neighborPos) return;

    // The pieces should be at the same position (since they're neighbors in a puzzle)
    // Just align them exactly
    const alignedPos = {
      x: neighborPos.x,
      y: neighborPos.y,
    };

    // Update the piece position
    const node = layer.findOne(`.${pieceId}`);
    if (node) {
      node.position(alignedPos);
      pathPositions.set(pieceId, alignedPos);
    }
  };

  const scaleMultiplier = 0.7;
  return (
    <Stage {...{ width, height }} {...otherProps}>
      <Layer
        ref={layerRef}
        scale={{ x: scale * scaleMultiplier, y: scale * scaleMultiplier }}
        // offset={{ x: -offsetX / scale, y: -offsetY / scale }}
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

              const layer = target.getLayer();
              if (!layer) return;

              // Commit positions for all group members
              if (dragGroupRef.current) {
                const { groupIds } = dragGroupRef.current;

                for (const memberId of groupIds) {
                  const node = layer.findOne(`.${memberId}`);
                  if (node) {
                    pathPositions.set(memberId, {
                      x: node.x(),
                      y: node.y(),
                    });
                  }
                }

                // Auto-align each piece in the group if it snapped with new neighbors
                for (const memberId of groupIds) {
                  autoAlignSnappedPieces(memberId, layer);
                }

                // Clear drag group state
                dragGroupRef.current = null;
              } else {
                // Fallback for non-group drags
                pathPositions.set(path.id, {
                  x: target.x(),
                  y: target.y(),
                });

                // Auto-align if snapped
                autoAlignSnappedPieces(path.id, layer);
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
              {...{ pathInitializers }}
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
  pathInitializers: Record<
    string,
    {
      initialPosition: { x: number; y: number };
      fillPatternOffset: FillPatternOffset;
    }
  >;
  fillPatternSrc: string;
  fillPatternTransform?: string;
}

const ImagePath: FC<ImagePathProps> = ({
  pathInitializers,
  fillPatternSrc,
  fillPatternTransform,
  ...otherProps
}) => {
  const ref = useRef<Konva.Path>(null);
  const [fillPatternImage] = useImage(fillPatternSrc);
  const { x, y } =
    typeof otherProps.name === "string"
      ? (pathInitializers[otherProps.name]?.fillPatternOffset ?? {})
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
