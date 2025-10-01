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
      hardcodedFillPatternOffsets={{
        "path-0": {
          x: 42,
          y: 0,
        },
        "path-1": {
          x: 60,
          y: 38,
        },
        "path-2": {
          x: 107,
          y: -383,
        },
        "path-3": {
          x: -83,
          y: -408,
        },
        "path-4": {
          x: -144,
          y: -792,
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
