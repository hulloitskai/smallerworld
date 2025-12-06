import { Modal, type ModalProps } from "@mantine/core";

import WriteIcon from "~icons/heroicons/pencil-square-20-solid";

import { usePageDialogOpened } from "~/helpers/pageDialog";
import { type Prompt, type PromptDeck } from "~/types";

import PromptStack from "./PromptStack";

import classes from "./PromptDeckModal.module.css";

const PROMPT_CARD_WIDTH = 220;
const PROMPT_CARD_HEIGHT = 300;
const PROMPT_CARD_FLIP_BOUNDARY = 125;

export interface PromptDeckModalProps
  extends Omit<ModalProps, "children" | "opened"> {
  deck: PromptDeck | null;
  onPromptSelected: (prompt: Prompt) => void;
}

const PromptDeckModal: FC<PromptDeckModalProps> = ({
  deck,
  onPromptSelected,
  className,
  ...otherProps
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [optimisticDeck, setOptimisticDeck] = useState(deck);
  useDidUpdate(() => {
    if (deck) {
      setOptimisticDeck(deck);
      setActiveIndex(0);
    }
  }, [deck]);
  const { data } = useRouteSWR<{ prompts: Prompt[] }>(routes.prompts.index, {
    params: optimisticDeck ? { prompt_deck_id: optimisticDeck.id } : null,
    descriptor: "load prompts",
    keepPreviousData: true,
  });
  const { prompts } = data ?? {};
  const selectedPrompt = prompts?.[activeIndex];
  const opened = !!deck;
  usePageDialogOpened(opened);
  return (
    <Modal
      {...{ opened }}
      centered
      fullScreen
      className={cn("PromptDeckModal", classes.modal, className)}
      {...otherProps}
    >
      <Stack align="center" gap="xl">
        {optimisticDeck && prompts ? (
          <PromptStack
            width={PROMPT_CARD_WIDTH}
            height={PROMPT_CARD_HEIGHT}
            flipBoundary={PROMPT_CARD_FLIP_BOUNDARY}
            radius="lg"
            deck={optimisticDeck}
            {...{ prompts }}
            onIndexChange={setActiveIndex}
            style={{ pointerEvents: "auto" }}
          />
        ) : (
          <Skeleton
            height={PROMPT_CARD_HEIGHT}
            width={PROMPT_CARD_WIDTH}
            radius="lg"
            style={{ pointerEvents: "auto" }}
          />
        )}
        <Button
          size="lg"
          variant="filled"
          radius="xl"
          style={{ pointerEvents: "auto" }}
          leftSection={<WriteIcon />}
          onClick={() => {
            if (selectedPrompt) {
              onPromptSelected(selectedPrompt);
            }
          }}
        >
          respond to this prompt
        </Button>
      </Stack>
    </Modal>
  );
};

export default PromptDeckModal;
