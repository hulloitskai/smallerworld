import { Text } from "@mantine/core";

import PageLayout from "~/components/PageLayout";

export interface MarshaPuzzlePageProps extends SharedPageProps {}

const MarshaPuzzlePage: PageComponent<MarshaPuzzlePageProps> = props => {
  useEffect(() => {
    console.log(props);
  }, []);
  return (
    <Stack>
      <Text>hi</Text>
    </Stack>
  );
};

MarshaPuzzlePage.layout = page => (
  <PageLayout>
    <Head>
      <title>Marsha's Puzzle</title>
    </Head>
    {page}
  </PageLayout>
);

export default MarshaPuzzlePage;
