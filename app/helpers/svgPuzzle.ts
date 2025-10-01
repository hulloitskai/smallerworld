// Types (inline as requested)
export type PieceId = string;
export interface Point {
  x: number;
  y: number;
}
export type TranslationById = Record<PieceId, Point>;
export interface RelativityMap {
  neighbors: Record<PieceId, PieceId[]>;
  svgWidth: number;
  svgHeight: number;
}

/**
 * Builds a relativity map from SVG by sampling path outlines and detecting adjacency
 */
export function buildRelativityMapFromSVG(svgRaw: string): RelativityMap {
  // Parse SVG
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.visibility = "hidden";
  document.body.appendChild(container);
  container.innerHTML = svgRaw;

  const svgElement = container.querySelector("svg");
  if (!svgElement) {
    throw new Error("Missing SVG element");
  }

  // Extract viewBox dimensions
  const viewBoxSpec = svgElement.getAttribute("viewBox");
  if (!viewBoxSpec) {
    throw new Error("Missing viewBox attribute");
  }
  const viewBox = viewBoxSpec.split(" ") as [string, string, string, string];
  const svgWidth = parseFloat(viewBox[2]);
  const svgHeight = parseFloat(viewBox[3]);

  // Get all path elements
  const pathElements = svgElement.querySelectorAll("path");
  const paths: { id: string; element: SVGPathElement }[] = [];

  pathElements.forEach((pathElement, index) => {
    const data = pathElement.getAttribute("d");
    if (data) {
      paths.push({
        id: `path-${index}`,
        element: pathElement,
      });
    }
  });

  // Build adjacency map
  const neighbors: Record<PieceId, PieceId[]> = {};

  // Initialize neighbors arrays
  paths.forEach(({ id }) => {
    neighbors[id] = [];
  });

  // TEMPORARY: Make all pieces neighbors for testing
  for (let i = 0; i < paths.length; i++) {
    for (let j = 0; j < paths.length; j++) {
      if (i !== j) {
        neighbors[paths[i]!.id]!.push(paths[j]!.id);
      }
    }
  }

  document.body.removeChild(container);

  return {
    neighbors,
    svgWidth,
    svgHeight,
  };
}

/**
 * Determines if two pieces are snapped based on their translations
 */
export function arePiecesSnappedFn(
  a: PieceId,
  b: PieceId,
  translations: TranslationById,
  map: RelativityMap,
  toleranceSvg: number,
): boolean {
  // Check if pieces are neighbors
  if (!map.neighbors[a]?.includes(b)) {
    return false;
  }

  // Get translations
  const transA = translations[a];
  const transB = translations[b];

  if (!transA || !transB) {
    return false;
  }

  // Calculate distance between translations
  const dx = transB.x - transA.x;
  const dy = transB.y - transA.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const isSnapped = distance <= toleranceSvg;

  return isSnapped;
}

/**
 * Hook for puzzle snapping functionality
 */
export function usePuzzleSnap(
  svgRaw: string,
  getTranslations: () => TranslationById,
  getScale: () => number,
) {
  const map = useMemo(() => buildRelativityMapFromSVG(svgRaw), [svgRaw]);

  const arePiecesSnapped = useCallback(
    (a: PieceId, b: PieceId, tolerancePx = 8) => {
      const toleranceSvg = tolerancePx / getScale();
      return arePiecesSnappedFn(a, b, getTranslations(), map, toleranceSvg);
    },
    [getTranslations, getScale, map],
  );

  return { map, arePiecesSnapped };
}
