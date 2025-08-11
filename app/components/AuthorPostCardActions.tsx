import { CopyButton, HoverCard, Text } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { groupBy } from "lodash-es";

import FollowUpIcon from "~icons/heroicons/arrow-path-rounded-square-20-solid";
import OpenedIcon from "~icons/heroicons/envelope-open-20-solid";
import ActionsIcon from "~icons/heroicons/pencil-square-20-solid";

import { mutatePosts, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type PostReaction, type User, type WorldPost } from "~/types";

import DrawerModal from "./DrawerModal";
import PostForm from "./PostForm";

import classes from "./AuthorPostCardActions.module.css";
import postCardClasses from "./PostCard.module.css";

export interface AuthorPostCardActionsProps {
  user: User;
  post: WorldPost;
  pausedFriendIds: string[];
  recentlyPausedFriendIds: string[];
  hideStats: boolean;
  onFollowUpDrawerModalOpened?: () => void;
}

const AuthorPostCardActions: FC<AuthorPostCardActionsProps> = ({
  user,
  post,
  pausedFriendIds,
  recentlyPausedFriendIds,
  hideStats,
  onFollowUpDrawerModalOpened,
}) => {
  const postUrl = useNormalizeUrl(
    () =>
      routes.users.show.path({
        id: user.handle,
        query: {
          post_id: post.id,
        },
      }),
    [user.handle, post.id],
  );
  const { ref, inViewport } = useInViewport();

  // == UI
  const [followUpDrawerModalOpened, setFollowUpModalDrawerOpened] =
    useState(false);
  const [followUpDrawerModalExiting, setFollowUpModalDrawerExiting] =
    useState(false);

  // == Load post stats
  const { data: statsData } = useRouteSWR<{
    notifiedFriends: number;
    viewers: number;
    repliers: number;
  }>(routes.posts.stats, {
    descriptor: "load post stats",
    params: !hideStats && inViewport ? { id: post.id } : null,
    keepPreviousData: true,
    refreshInterval: 5000,
    isVisible: () => inViewport,
  });

  // == Load reactions
  const { data: reactionsData } = useRouteSWR<{ reactions: PostReaction[] }>(
    routes.postReactions.index,
    {
      params: !hideStats && inViewport ? { post_id: post.id } : null,
      descriptor: "load reactions",
      keepPreviousData: true,
      refreshInterval: 5000,
      isVisible: () => inViewport,
    },
  );
  const { reactions } = reactionsData ?? {};
  const reactionsByEmoji = useMemo(
    () => groupBy(reactions, "emoji"),
    [reactions],
  );

  // == Delete post
  const { trigger: deletePost, mutating: deletingPost } = useRouteMutation(
    routes.posts.destroy,
    {
      params: {
        id: post.id,
      },
      descriptor: "delete post",
      onSuccess: () => {
        void mutatePosts();
        void mutateRoute(routes.posts.pinned);
        void mutateRoute(routes.encouragements.index);
      },
    },
  );

  return (
    <>
      <Group {...{ ref }} align="start" gap={3}>
        <Group align="start" gap={3} style={{ flexGrow: 1 }}>
          {(!!statsData?.notifiedFriends || !!statsData?.viewers) && (
            <>
              <HoverCard position="bottom-start" arrowOffset={20} shadow="sm">
                <HoverCard.Target>
                  <ActionIcon
                    size="xs"
                    variant="transparent"
                    className={classes.statsIcon}
                  >
                    {statsData?.viewers ? <OpenedIcon /> : <NotificationIcon />}
                  </ActionIcon>
                </HoverCard.Target>
                <HoverCard.Dropdown px="xs" py={8}>
                  <List className={classes.statsList}>
                    {!!statsData?.notifiedFriends && (
                      <List.Item icon={<NotificationIcon />}>
                        notified {statsData.notifiedFriends}{" "}
                        {inflect("friend", statsData.notifiedFriends)}
                      </List.Item>
                    )}
                    {!!statsData?.viewers && (
                      <List.Item icon={<OpenedIcon />}>
                        seen by {statsData.viewers}{" "}
                        {inflect("friend", statsData.viewers)}
                      </List.Item>
                    )}
                    {!!statsData?.repliers && (
                      <List.Item icon={<ReplyIcon />}>
                        {inflect("reply", statsData.repliers)} from{" "}
                        {statsData.repliers}{" "}
                        {inflect("friend", statsData.repliers)}
                      </List.Item>
                    )}
                  </List>
                </HoverCard.Dropdown>
              </HoverCard>
            </>
          )}
          {(!!statsData?.notifiedFriends || !!statsData?.viewers) &&
            !isEmpty(reactions) && (
              <Text className={postCardClasses.actionSeparator}>/</Text>
            )}
          {!isEmpty(reactions) && (
            <Group gap={2} wrap="wrap" style={{ flexGrow: 1, rowGap: 0 }}>
              {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
                <Badge
                  key={emoji}
                  variant="transparent"
                  color="gray"
                  leftSection={emoji}
                  className={classes.reactionBadge}
                >
                  {reactions.length}
                </Badge>
              ))}
            </Group>
          )}
        </Group>
        <Menu width={165}>
          <Menu.Target>
            <Button
              variant="subtle"
              size="compact-xs"
              leftSection={<ActionsIcon />}
              loading={deletingPost}
              style={{ flexShrink: 0 }}
            >
              actions
            </Button>
          </Menu.Target>
          <Menu.Dropdown style={{ pointerEvents: "auto" }}>
            <Menu.Item
              leftSection={<EditIcon />}
              onClick={() => {
                openModal({
                  title: <>edit {POST_TYPE_TO_LABEL[post.type]}</>,
                  size: "var(--container-size-xs)",
                  children: (
                    <PostForm
                      {...{ post }}
                      onPostUpdated={() => {
                        closeAllModals();
                      }}
                    />
                  ),
                });
              }}
            >
              edit post
            </Menu.Item>
            <Menu.Item
              leftSection={<DeleteIcon />}
              onClick={() => {
                openConfirmModal({
                  title: "really delete post?",
                  children: <>you can't undo this action</>,
                  cancelProps: { variant: "light", color: "gray" },
                  groupProps: { gap: "xs" },
                  labels: {
                    confirm: "do it",
                    cancel: "wait nvm",
                  },
                  styles: {
                    header: {
                      minHeight: 0,
                      paddingBottom: 0,
                    },
                  },
                  onConfirm: () => {
                    void deletePost();
                  },
                });
              }}
            >
              delete post
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<FollowUpIcon />}
              disabled={post.type === "follow_up"}
              onClick={() => {
                setFollowUpModalDrawerOpened(true);
                onFollowUpDrawerModalOpened?.();
              }}
            >
              follow-up
            </Menu.Item>
            <CopyButton value={postUrl ?? ""}>
              {({ copied, copy }) => (
                <Menu.Item
                  leftSection={copied ? <CopiedIcon /> : <CopyIcon />}
                  disabled={!postUrl}
                  closeMenuOnClick={false}
                  onClick={() => {
                    copy();
                  }}
                >
                  {copied ? "link copied!" : "copy link"}
                </Menu.Item>
              )}
            </CopyButton>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <DrawerModal
        title="new follow-up"
        opened={followUpDrawerModalOpened}
        onClose={() => {
          setFollowUpModalDrawerOpened(false);
          setFollowUpModalDrawerExiting(true);
        }}
        onExitTransitionEnd={() => {
          setFollowUpModalDrawerExiting(false);
        }}
      >
        {(followUpDrawerModalOpened || followUpDrawerModalExiting) && (
          <PostForm
            newPostType="follow_up"
            {...{ pausedFriendIds, recentlyPausedFriendIds }}
            quotedPost={post}
            onPostCreated={() => {
              setFollowUpModalDrawerOpened(false);
            }}
          />
        )}
      </DrawerModal>
    </>
  );
};

export default AuthorPostCardActions;
