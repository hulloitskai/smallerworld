import { Head } from "@inertiajs/react";
import { useMantineColorScheme } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { lazy, Suspense } from "react";

import PageLayout from "~/components/PageLayout";
import { type FillPatternOffset } from "~/components/SVGPuzzle";

const LazySVGPuzzle = lazy(() => import("~/components/SVGPuzzle"));

export interface MarshaPuzzlePageProps extends SharedPageProps {
  puzzleSvg: string;
  hardcodedFillPatternOffsets: Record<string, FillPatternOffset>;
}

const MarshaPuzzlePage: PageComponent<MarshaPuzzlePageProps> = ({
  puzzleSvg,
  hardcodedFillPatternOffsets,
}) => {
  const { setColorScheme } = useMantineColorScheme();
  useEffect(() => {
    setColorScheme("light");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { width, height } = useViewportSize();
  return (
    <Suspense>
      <LazySVGPuzzle
        svgData={puzzleSvg}
        {...{ width, height, hardcodedFillPatternOffsets }}
        debugSnapOverlay={true}
      />
    </Suspense>
  );
};

export default MarshaPuzzlePage;

MarshaPuzzlePage.layout = page => (
  <PageLayout>
    <Head>
      <title>Marsha's Puzzle</title>
    </Head>
    {page}
  </PageLayout>
);
