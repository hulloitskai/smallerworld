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

  return <SVGPuzzle svgData={puzzle1Data} {...{ width, height }} />;
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
