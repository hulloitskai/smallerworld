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

interface SVGPuzzleProps extends StageProps {
  svgData: string;
  width: number;
  height: number;
}

interface ParsedPath {
  id: string;
  data: string;
  fill?: string;
  fillPattern?: string;
  fillPatternScale?: { x: number; y: number };
  fillPatternOffset?: { x: number; y: number };
  stroke?: string;
  strokeWidth?: number;
  transform: string | null;
  x: number;
  y: number;
}

interface ParsedSVGData {
  paths: ParsedPath[];
  patterns: Record<
    string,
    {
      href: string;
      scaleX: number;
      scaleY: number;
      translateX: number;
      translateY: number;
    }
  >;
  svgWidth: number;
  svgHeight: number;
}

const SVGPuzzle: FC<SVGPuzzleProps> = ({
  svgData,
  width,
  height,
  ...otherProps
}) => {
  // Parse SVG and extract patterns and viewBox
  const { paths, svgWidth, svgHeight } = useMemo<ParsedSVGData>(() => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgData, "image/svg+xml");
    const svgElement = svgDoc.querySelector("svg");
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
        scaleX: number;
        scaleY: number;
        translateX: number;
        translateY: number;
      }
    > = {};

    svgDoc.querySelectorAll("pattern").forEach(pattern => {
      const id = pattern.getAttribute("id");
      const useElement = pattern.querySelector("use");
      const imageRef = useElement?.getAttribute("xlink:href");
      const transformAttr = useElement?.getAttribute("transform");

      if (id && imageRef) {
        // Remove the "#" and find the actual image element
        const imageId = imageRef.substring(1);
        const imageElement = svgDoc.querySelector(`image[id="${imageId}"]`);
        const href =
          imageElement?.getAttribute("xlink:href") ??
          imageElement?.getAttribute("href");

        if (href?.startsWith("data:")) {
          invariant(href, `Pattern ${id} missing image data`);

          // Parse matrix transform: matrix(scaleX, skewY, skewX, scaleY, translateX, translateY)
          let scaleX = 1,
            scaleY = 1,
            translateX = 0,
            translateY = 0;

          if (transformAttr) {
            const matrixMatch = transformAttr.match(/matrix\(([^)]+)\)/);
            if (matrixMatch?.[1]) {
              const values = matrixMatch[1]
                .split(/[,\s]+/)
                .map(Number)
                .filter(v => !isNaN(v));
              if (values.length >= 6) {
                scaleX = values[0] ?? 1;
                scaleY = values[3] ?? 1;
                translateX = values[4] ?? 0;
                translateY = values[5] ?? 0;
              }
            }
          }

          patterns[id] = { href, scaleX, scaleY, translateX, translateY };
          console.log(`Pattern ${id}:`, {
            scaleX,
            scaleY,
            translateX,
            translateY,
          });
        }
      }
    });

    console.log(
      `Found ${Object.keys(patterns).length} patterns:`,
      Object.keys(patterns),
    );

    const pathElements = svgDoc.querySelectorAll("path");
    const paths = Array.from(pathElements).map<ParsedPath>(
      (pathElement, index) => {
        const data = pathElement.getAttribute("d");
        invariant(data, `Path ${index} missing 'd' attribute`);

        const fill = pathElement.getAttribute("fill") ?? undefined;
        const stroke = pathElement.getAttribute("stroke") ?? undefined;
        const strokeWidth = parseStrokeWidth(pathElement);
        const transform = pathElement.getAttribute("transform");

        // Get the bounding box first for coordinate conversion
        const bbox = pathElement.getBBox();

        let fillPattern: string | undefined;
        let fillPatternScale: { x: number; y: number } | undefined;
        let fillPatternOffset: { x: number; y: number } | undefined;
        if (fill?.startsWith("url(#")) {
          const patternId = fill.match(/url\(#([^)]+)\)/)?.[1];
          if (patternId && patterns[patternId]) {
            const pattern = patterns[patternId];
            fillPattern = pattern.href;

            // Try using SVG dimensions for scale calculation like we did for offset
            fillPatternScale = {
              x: pattern.scaleX * svgWidth,
              y: pattern.scaleY * svgHeight,
            };
            // Use SVG dimensions instead of bbox since bbox is often 0x0
            fillPatternOffset = {
              x: pattern.translateX * svgWidth,
              y: pattern.translateY * svgHeight,
            };

            console.log(`Path ${index} with pattern ${patternId}:`);
            console.log(`  bbox: ${bbox.width}x${bbox.height}`);
            console.log(
              `  original scaleX: ${pattern.scaleX}, scaleY: ${pattern.scaleY}`,
            );
            console.log(
              `  original translateX: ${pattern.translateX}, translateY: ${pattern.translateY}`,
            );
            console.log(
              `  inverse scales would be: ${1 / pattern.scaleX}, ${1 / pattern.scaleY}`,
            );
            console.log(
              `  fillPatternScale: ${fillPatternScale ? `${fillPatternScale.x.toFixed(2)}, ${fillPatternScale.y.toFixed(2)}` : "undefined"}`,
            );
            console.log(
              `  fillPatternOffset: ${fillPatternOffset ? `${fillPatternOffset.x.toFixed(2)}, ${fillPatternOffset.y.toFixed(2)}` : "undefined"}`,
            );
            console.log(`  svgDimensions: ${svgWidth}x${svgHeight}`);
          }
        }
        return {
          id: `path-${index}`,
          data,
          fill,
          stroke,
          strokeWidth,
          transform,
          fillPattern,
          fillPatternScale,
          fillPatternOffset,
          x: bbox.x,
          y: bbox.y,
        };
      },
    );

    return { paths, patterns, svgWidth, svgHeight };
  }, [svgData]);

  // Initialize path positions from parsed SVG data
  const pathPositions = useMap<string, { x: number; y: number }>();
  useEffect(() => {
    pathPositions.clear();
    paths.forEach(({ id, x, y }) => {
      pathPositions.set(id, { x, y });
    });
  }, [paths]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <Stage {...{ width, height }} {...otherProps}>
      <Layer
        scale={{ x: scale, y: scale }}
        offset={{ x: -offsetX / scale, y: -offsetY / scale }}
      >
        {paths.map(path => {
          const { x, y } = pathPositions.get(path.id) ?? path;
          const props: Konva.PathConfig & KonvaNodeEvents = {
            key: path.id,
            data: path.data,
            x,
            y,
            stroke: path.stroke,
            strokeWidth: path.strokeWidth,
            draggable: true,
            onDragEnd: ({ target }) => {
              pathPositions.set(path.id, {
                x: target.x(),
                y: target.y(),
              });
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
            onDragStart: () => {
              document.body.style.cursor = "grabbing";
            },
          };
          return path.fillPattern ? (
            <ImagePath
              {...props}
              fillPattern={path.fillPattern}
              fillPatternScale={path.fillPatternScale}
              fillPatternOffset={path.fillPatternOffset}
            />
          ) : (
            <Path {...props} fill={path.fill} />
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

interface ImagePathProps
  extends Omit<
    Konva.PathConfig,
    "fillPatternImage" | "fillPatternScale" | "fillPatternOffset"
  > {
  fillPattern: string;
  fillPatternScale?: { x: number; y: number };
  fillPatternOffset?: { x: number; y: number };
}

const ImagePath: FC<ImagePathProps> = ({
  fillPattern,
  fillPatternScale,
  fillPatternOffset,
  ...otherProps
}) => {
  const [image, status] = useImage(fillPattern);

  console.log("ImagePath rendering:");
  console.log(`  image loaded: ${!!image}, status: ${status}`);
  console.log(
    `  image size: ${image ? `${image.width}x${image.height}` : "null"}`,
  );
  console.log(
    `  fillPatternScale: ${fillPatternScale ? `${fillPatternScale.x}, ${fillPatternScale.y}` : "undefined"}`,
  );
  console.log(
    `  fillPatternOffset: ${fillPatternOffset ? `${fillPatternOffset.x}, ${fillPatternOffset.y}` : "undefined"}`,
  );

  return (
    <Path
      {...otherProps}
      fillPatternImage={image}
      fillPatternScale={fillPatternScale}
      fillPatternOffset={fillPatternOffset}
    />
  );
};
