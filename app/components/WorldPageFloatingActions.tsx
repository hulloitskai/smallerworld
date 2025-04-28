import { Affix, HoverCard, Indicator, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import DraftIcon from "~icons/heroicons/ellipsis-horizontal-20-solid";
import DraftCircleIcon from "~icons/heroicons/ellipsis-horizontal-circle-20-solid";
import MegaphoneIcon from "~icons/heroicons/megaphone-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import {
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  POST_TYPES,
} from "~/helpers/posts";
import { useNewPostDraft } from "~/helpers/posts/form";
import { useWebPush } from "~/helpers/webPush";
import { type WorldPageProps } from "~/pages/WorldPage";
import { type Encouragement, type PostType, type WorldPost } from "~/types";

import AuthorPostCardActions from "./AuthorPostCardActions";
import DrawerModal from "./DrawerModal";
import PostCard from "./PostCard";
import PostForm, { type PostFormProps } from "./PostForm";

import classes from "./WorldPageFloatingActions.module.css";

export interface WorldPageFloatingActionsProps
  extends Pick<PostFormProps, "pausedFriends"> {
  onPostCreated?: () => void;
}

const WorldPageFloatingActions: FC<WorldPageFloatingActionsProps> = ({
  pausedFriends,
  onPostCreated,
}) => {
  const { currentUser, hideStats } = usePageProps<WorldPageProps>();
  const isStandalone = useIsStandalone();
  const { registration } = useWebPush();
  const { modals } = useModals();

  // == Post type
  const [postType, setPostType] = useState<PostType | null>(null);
  const previousPostType = usePrevious(postType);

  // == Load encouragements
  const { data: encouragementsData } = useRouteSWR<{
    encouragements: Encouragement[];
  }>(routes.encouragements.index, {
    descriptor: "load encouragements",
    keepPreviousData: true,
  });
  const encouragements = encouragementsData?.encouragements ?? [];

  // == Load pinned posts
  const { data: pinnedPostsData } = useRouteSWR<{ posts: WorldPost[] }>(
    routes.posts.pinned,
    {
      descriptor: "load pinned posts",
      keepPreviousData: true,
    },
  );
  const pinnedPosts = pinnedPostsData?.posts ?? [];

  // == Pinned posts drawer modal
  const [pinnedPostsDrawerModalOpened, setPinnedPostsDrawerModalOpened] =
    useState(false);

  // == New post draft
  const [newPostDraft] = useNewPostDraft();

  const actionsVisible =
    (isStandalone === false || !!registration) && !pinnedPostsDrawerModalOpened;
  return (
    <>
      <Space className={classes.space} />
      <Affix className={classes.affix} position={{}} zIndex={180}>
        <Transition
          transition="pop"
          mounted={
            isEmpty(modals) && !postType && !pinnedPostsDrawerModalOpened
          }
          enterDelay={100}
        >
          {style => (
            <Group
              align="end"
              justify="center"
              gap={8}
              style={[style, { pointerEvents: "none" }]}
            >
              <Transition
                transition="pop"
                mounted={actionsVisible}
                enterDelay={100}
              >
                {style => (
                  <Stack gap={6} w="min-content" {...{ style }}>
                    <Group gap={6} wrap="wrap" style={{ alignSelf: "center" }}>
                      {encouragements.map(encouragement => (
                        <HoverCard
                          key={encouragement.id}
                          position="top"
                          shadow="sm"
                        >
                          <HoverCard.Target>
                            <ActionIcon
                              className={classes.encouragementButton}
                              variant="outline"
                              size="sm"
                            >
                              {encouragement.emoji}
                            </ActionIcon>
                          </HoverCard.Target>
                          <HoverCard.Dropdown px="xs" py={8} maw={240}>
                            <Stack gap={2}>
                              <Text size="sm">
                                &ldquo;{encouragement.message}&rdquo;
                              </Text>
                              <Text
                                size="xs"
                                c="dimmed"
                                style={{ alignSelf: "end" }}
                              >
                                —{" "}
                                {[
                                  encouragement.friend.emoji,
                                  encouragement.friend.name,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              </Text>
                            </Stack>
                          </HoverCard.Dropdown>
                        </HoverCard>
                      ))}
                    </Group>
                    <Menu
                      width={220}
                      shadow="sm"
                      classNames={{
                        dropdown: classes.menuDropdown,
                        itemLabel: classes.menuItemLabel,
                        itemSection: classes.menuItemSection,
                      }}
                    >
                      <Menu.Target>
                        <Indicator
                          className={classes.newPostDraftIndicator}
                          color="white"
                          label={<DraftIcon />}
                          size={16}
                          offset={4}
                          disabled={!newPostDraft}
                        >
                          <Button
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
                      <Menu.Dropdown style={{ pointerEvents: "auto" }}>
                        {POST_TYPES.map(type => (
                          <Menu.Item
                            key={type}
                            leftSection={
                              <Box
                                component={POST_TYPE_TO_ICON[type]}
                                fz="md"
                              />
                            }
                            {...(type === newPostDraft?.postType && {
                              rightSection: (
                                <Box
                                  component={DraftCircleIcon}
                                  className={classes.menuItemDraftIcon}
                                />
                              ),
                            })}
                            onClick={() => {
                              setPostType(type);
                            }}
                          >
                            new {POST_TYPE_TO_LABEL[type]}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  </Stack>
                )}
              </Transition>
              <Transition
                transition="pop"
                mounted={actionsVisible && !isEmpty(pinnedPosts)}
                enterDelay={100}
              >
                {style => (
                  <ActionIcon
                    className={classes.pinnedPostsButton}
                    variant="outline"
                    size={42}
                    radius="xl"
                    {...{ style }}
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
      <DrawerModal
        title={
          <>
            new{" "}
            {postType ? (
              POST_TYPE_TO_LABEL[postType]
            ) : (
              <Skeleton>placeholder</Skeleton>
            )}
          </>
        }
        opened={!!postType}
        onClose={() => {
          setPostType(null);
        }}
      >
        <PostForm
          {...{ pausedFriends }}
          postType={postType ?? previousPostType ?? null}
          onPostCreated={() => {
            setPostType(null);
            onPostCreated?.();
          }}
        />
      </DrawerModal>
      <DrawerModal
        title="your invitations to your friends"
        opened={!postType && pinnedPostsDrawerModalOpened}
        onClose={() => {
          setPinnedPostsDrawerModalOpened(false);
        }}
      >
        <Stack>
          {pinnedPosts.map(post => (
            <PostCard
              key={post.id}
              {...{ post }}
              actions={
                <AuthorPostCardActions
                  user={currentUser}
                  {...{ post, hideStats, pausedFriends }}
                  onFollowUpDrawerModalOpened={() => {
                    setPinnedPostsDrawerModalOpened(false);
                  }}
                />
              }
            />
          ))}
        </Stack>
      </DrawerModal>
    </>
  );
};

export default WorldPageFloatingActions;
