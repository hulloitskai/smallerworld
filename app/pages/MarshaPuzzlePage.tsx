import { Head } from "@inertiajs/react";
import { useMantineColorScheme } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { useEffect } from "react";

import puzzle1Data from "~/assets/marshapuzzle/puzzle1.svg?raw";

import PageLayout from "~/components/PageLayout";
import SVGPuzzle from "~/components/SVGPuzzle";

export interface MarshaPuzzlePageProps extends SharedPageProps {}

const MarshaPuzzlePage: PageComponent<MarshaPuzzlePageProps> = () => {
  const { setColorScheme } = useMantineColorScheme();
  useEffect(() => {
    setColorScheme("light");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { width, height } = useViewportSize();
  return (
    <SVGPuzzle
      svgData={puzzle1Data}
      {...{ width, height }}
      debugSnapOverlay={true}
      hardcodedFillPatternOffsets={{
        "path-0": {
          x: -70,
          y: -113,
        },
        "path-1": {
          x: -396,
          y: -34,
        },
        "path-2": {
          x: -92,
          y: -726,
        },
        "path-3": {
          x: -449,
          y: -714,
        },
        "path-4": {
          x: -342,
          y: -1157,
        },
      }}
    />
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
