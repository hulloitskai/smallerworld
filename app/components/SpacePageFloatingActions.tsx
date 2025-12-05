import { Affix, Indicator } from "@mantine/core";
import { useModals } from "@mantine/modals";

import DraftIcon from "~icons/heroicons/ellipsis-horizontal-20-solid";
import DraftCircleIcon from "~icons/heroicons/ellipsis-horizontal-circle-20-solid";
import MegaphoneIcon from "~icons/heroicons/megaphone-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import { NEKO_SIZE } from "~/helpers/neko";
import {
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  SELECTABLE_POST_TYPES,
  spacePostDraftKey,
} from "~/helpers/posts";
import { useSavedDraftType } from "~/helpers/posts/drafts";
import { type SpacePageProps } from "~/pages/SpacePage";
import { type PromptDeck, type SpacePost } from "~/types";

import DrawerModal from "./DrawerModal";
import FeedbackNeko from "./FeedbackNeko";
import { openNewSpacePostModal } from "./NewSpacePostModal";
import PostCard from "./PostCard";
import PromptDeckDrawer from "./PromptDeckDrawer";
import PromptDeckModal from "./PromptDeckModal";
import SpacePostCardAuthorActions from "./SpacePostCardAuthorActions";
import SpacePostCardFriendActions from "./SpacePostCardFriendActions";

import classes from "./SpacePageFloatingActions.module.css";

export interface SpacePageFloatingActionsProps {}

const SpacePageFloatingActions: FC<SpacePageFloatingActionsProps> = () => {
  const { space } = usePageProps<SpacePageProps>();
  const { modals } = useModals();
  const currentUser = useCurrentUser();
  const isOwner = currentUser?.id === space.owner_id;

  // == Load pinned posts
  const { data: pinnedPostsData } = useRouteSWR<{ posts: SpacePost[] }>(
    routes.spacePosts.pinned,
    {
      params: {
        space_id: space.id,
      },
      descriptor: "load pinned posts",
      keepPreviousData: true,
    },
  );
  const pinnedPosts = pinnedPostsData?.posts ?? [];

  // == Pinned posts drawer modal
  const [pinnedPostsDrawerModalOpened, setPinnedPostsDrawerModalOpened] =
    useState(false);

  const [menuOpened, setMenuOpened] = useState(false);
  const [promptDeckDrawerOpened, setPromptDeckDrawerOpened] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<PromptDeck | null>(null);

  // == Draft type
  const draftType = useSavedDraftType({
    localStorageKey: spacePostDraftKey(space.id),
  });

  return (
    <>
      <Space className={classes.space} />
      <Affix position={{}} zIndex={180} className={classes.affix}>
        <Transition
          transition="pop"
          mounted={isEmpty(modals) && !pinnedPostsDrawerModalOpened}
          enterDelay={100}
        >
          {transitionStyle => (
            <Group
              align="end"
              justify="center"
              gap={8}
              style={[{ pointerEvents: "none" }, transitionStyle]}
            >
              <Box pos="relative">
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
                      disabled={!draftType}
                    >
                      <Button
                        id="new-post"
                        size="md"
                        variant="filled"
                        radius="xl"
                        className={classes.menuButton}
                        leftSection={<Box component={NewIcon} fz="lg" />}
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
                          <Box
                            component={POST_TYPE_TO_ICON[postType]}
                            fz="md"
                          />
                        }
                        {...(postType === draftType && {
                          rightSection: (
                            <Box
                              component={DraftCircleIcon}
                              className={classes.menuItemDraftIcon}
                            />
                          ),
                        })}
                        onClick={() => {
                          openNewSpacePostModal({
                            spaceId: space.id,
                            postType,
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
                          setPromptDeckDrawerOpened(true);
                        }}
                      >
                        answer a prompt
                      </Button>
                    </Center>
                  </Menu.Dropdown>
                </Menu>
                {currentUser && (
                  <FeedbackNeko
                    pos="absolute"
                    top={3 - NEKO_SIZE}
                    right="var(--mantine-spacing-lg)"
                  />
                )}
              </Box>
              <Transition
                transition="pop"
                mounted={!isEmpty(pinnedPosts)}
                enterDelay={100}
              >
                {transitionStyle => (
                  <ActionIcon
                    className={classes.pinnedPostsButton}
                    variant="outline"
                    size={42}
                    radius="xl"
                    style={transitionStyle}
                    onClick={() => {
                      setPinnedPostsDrawerModalOpened(true);
                    }}
                  >
                    <Indicator
                      className={classes.pinnedPostsIndicator}
                      label={pinnedPosts.length}
                      size={16}
                      offset={-4}
                    >
                      <MegaphoneIcon />
                    </Indicator>
                  </ActionIcon>
                )}
              </Transition>
            </Group>
          )}
        </Transition>
      </Affix>
      <PromptDeckDrawer
        opened={promptDeckDrawerOpened}
        onClose={() => {
          setPromptDeckDrawerOpened(false);
        }}
        onDeckSelect={deck => {
          setPromptDeckDrawerOpened(false);
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
            openNewSpacePostModal({
              spaceId: space.id,
              postType: "response",
              prompt: { ...prompt, deck },
              keepMounted: true,
            });
          }
        }}
        onClose={() => {
          setSelectedDeck(null);
        }}
      />
      <DrawerModal
        title="pinned posts"
        opened={pinnedPostsDrawerModalOpened}
        onClose={() => {
          setPinnedPostsDrawerModalOpened(false);
        }}
      >
        <Stack>
          {pinnedPosts.map(post => (
            <PostCard
              key={post.id}
              {...{ post }}
              author={{
                name: post.author_name,
                world: post.author_world,
              }}
              actions={
                isOwner ? (
                  <SpacePostCardAuthorActions
                    {...{ space, post }}
                    onEditModalOpened={() => {
                      setPinnedPostsDrawerModalOpened(false);
                    }}
                  />
                ) : (
                  <SpacePostCardFriendActions {...{ post }} />
                )
              }
            />
          ))}
        </Stack>
      </DrawerModal>
    </>
  );
};

export default SpacePageFloatingActions;
