import { type ButtonProps, Indicator } from "@mantine/core";

import DraftIcon from "~icons/heroicons/ellipsis-horizontal-20-solid";
import DraftCircleIcon from "~icons/heroicons/ellipsis-horizontal-circle-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import {
  type NewWorldPostModalProps,
  openNewWorldPostModal,
} from "~/components/NewWorldPostModal";
import {
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  SELECTABLE_POST_TYPES,
  worldPostDraftKey,
} from "~/helpers/posts";
import { useSavedDraftType } from "~/helpers/posts/drafts";
import { type PromptDeck } from "~/types";

import PromptDeckDrawer from "./PromptDeckDrawer";
import PromptDeckModal from "./PromptDeckModal";

import classes from "./NewWorldPostButton.module.css";

export interface NewWorldPostButtonProps
  extends Omit<ButtonProps, "children">,
    Pick<
      NewWorldPostModalProps,
      "worldId" | "encouragementId" | "onPostCreated"
    > {}

const NewWorldPostButton: FC<NewWorldPostButtonProps> = ({
  worldId,
  encouragementId,
  onPostCreated,
  className,
  ...otherProps
}) => {
  const newPostDraftType = useSavedDraftType({
    localStorageKey: worldPostDraftKey(worldId),
  });
  const [menuOpened, setMenuOpened] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<PromptDeck | null>(null);

  return (
    <>
      <Menu
        width={220}
        shadow="sm"
        opened={menuOpened}
        onChange={setMenuOpened}
        classNames={{
          dropdown: classes.menuDropdown,
          itemLabel: classes.menuItemLabel,
          itemSection: classes.menuItemSection,
        }}
      >
        <Menu.Target>
          <Indicator
            className={classes.newPostDraftIndicator}
            label={<DraftIcon />}
            size={16}
            offset={4}
            color="white"
            disabled={!newPostDraftType}
          >
            <Button
              id="new-post"
              size="md"
              variant="filled"
              radius="xl"
              className={cn(
                "NewWorldPostButton",
                classes.menuButton,
                className,
              )}
              leftSection={<Box component={NewIcon} fz="lg" />}
              {...otherProps}
            >
              new post
            </Button>
          </Indicator>
        </Menu.Target>
        <Menu.Dropdown>
          {SELECTABLE_POST_TYPES.map(postType => (
            <Menu.Item
              key={postType}
              leftSection={
                <Box component={POST_TYPE_TO_ICON[postType]} fz="md" />
              }
              {...(postType === newPostDraftType && {
                rightSection: (
                  <Box
                    component={DraftCircleIcon}
                    className={classes.menuItemDraftIcon}
                  />
                ),
              })}
              onClick={() => {
                openNewWorldPostModal({
                  worldId,
                  postType,
                  encouragementId,
                  onPostCreated,
                });
              }}
            >
              new {POST_TYPE_TO_LABEL[postType]}
            </Menu.Item>
          ))}
          <Center className={classes.promptButtonContainer}>
            <Button
              size="md"
              variant="gradient"
              gradient={{ from: "blue", to: "primary" }}
              leftSection="🃏"
              className={classes.promptButton}
              onClick={() => {
                setMenuOpened(false);
                setDrawerOpened(true);
              }}
            >
              answer a prompt
            </Button>
          </Center>
        </Menu.Dropdown>
      </Menu>
      <PromptDeckDrawer
        opened={drawerOpened}
        onClose={() => {
          alert("we just closed...");
          setDrawerOpened(false);
        }}
        onDeckSelect={deck => {
          setDrawerOpened(false);
          setTimeout(() => {
            setSelectedDeck(deck);
          }, 200);
        }}
      />
      <PromptDeckModal
        deck={selectedDeck}
        onPromptSelected={prompt => {
          const deck = selectedDeck;
          setSelectedDeck(null);
          if (deck) {
            openNewWorldPostModal({
              worldId,
              postType: "response",
              prompt: { ...prompt, deck },
              onPostCreated,
            });
          }
        }}
        onClose={() => {
          setSelectedDeck(null);
        }}
      />
    </>
  );
};

export default NewWorldPostButton;
