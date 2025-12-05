import { Carousel } from "@mantine/carousel";
import { Text } from "@mantine/core";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

import { usePageDialogOpened } from "~/helpers/pageDialog";
import { type PromptDeck } from "~/types";

import Drawer, { type DrawerProps } from "./Drawer";

import classes from "./PromptDeckDrawer.module.css";
import "@mantine/carousel/styles.layer.css";

const DECK_CARD_WIDTH = 200;

export interface PromptDeckDrawerProps extends Omit<DrawerProps, "children"> {
  onDeckSelect: (deck: PromptDeck) => void;
}

const PromptDeckDrawer: FC<PromptDeckDrawerProps> = ({
  opened,
  onDeckSelect,
  ...otherProps
}) => {
  usePageDialogOpened(opened);
  const [wheelGesturesPlugin] = useState(WheelGesturesPlugin);

  const { data: decksData } = useRouteSWR<{ decks: PromptDeck[] }>(
    routes.promptDecks.index,
    {
      descriptor: "load prompt decks",
    },
  );
  const decks = decksData?.decks ?? [];

  return (
    <Drawer title="pick a deck" {...{ opened }} {...otherProps}>
      <Carousel
        className={classes.carousel}
        slideSize={DECK_CARD_WIDTH}
        slideGap="md"
        plugins={[wheelGesturesPlugin]}
        emblaOptions={{ align: "center" }}
      >
        {decks.map(deck => (
          <Carousel.Slide key={deck.id}>
            <Card
              className={classes.card}
              bg={deck.background_color}
              c={deck.text_color}
              onClick={() => {
                onDeckSelect(deck);
              }}
            >
              <Text size="xl" className={classes.deckName}>
                {deck.name}
              </Text>
              {!!deck.edition && (
                <Text size="xs" className={classes.deckEdition}>
                  {deck.edition}
                </Text>
              )}
            </Card>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Drawer>
  );
};

export default PromptDeckDrawer;
