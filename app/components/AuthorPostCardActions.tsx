import { HoverCard, Loader, Text } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { groupBy } from "lodash-es";

import FollowUpIcon from "~icons/heroicons/arrow-path-rounded-square-20-solid";
import OpenedIcon from "~icons/heroicons/envelope-open-20-solid";
import ActionsIcon from "~icons/heroicons/pencil-square-20-solid";
import ShareIcon from "~icons/heroicons/share-20-solid";

import { mutateWorldPosts, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type PostReaction, type PostShare, type WorldPost } from "~/types";

import { type FriendProfile } from "../types/generated";
import DrawerModal from "./DrawerModal";
import PostForm from "./PostForm";

import classes from "./AuthorPostCardActions.module.css";
import postCardClasses from "./PostCard.module.css";

export interface AuthorPostCardActionsProps {
  post: WorldPost;
  pausedFriendIds: string[];
  recentlyPausedFriendIds: string[];
  hideStats: boolean;
  onFollowUpDrawerModalOpened?: () => void;
}

const AuthorPostCardActions: FC<AuthorPostCardActionsProps> = ({
  post,
  pausedFriendIds,
  recentlyPausedFriendIds,
  hideStats,
  onFollowUpDrawerModalOpened,
}) => {
  const { ref, inViewport } = useInViewport();

  // == Stats clicked count
  const [_statsClickedCount, setStatsClickedCount] = useState(0);

  // == Load post stats
  const { data: statsData } = useRouteSWR<{
    notifiedFriends: number;
    viewers: number;
    repliers: number;
  }>(routes.worldPosts.stats, {
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
    routes.worldPosts.destroy,
    {
      params: {
        id: post.id,
      },
      descriptor: "delete post",
      onSuccess: () => {
        void mutateWorldPosts();
        void mutateRoute(routes.worldPosts.pinned);
        void mutateRoute(routes.worldEncouragements.index);
      },
    },
  );

  const [followUpDrawerModalOpened, setFollowUpModalDrawerOpened] =
    useState(false);
  const [followUpDrawerModalExiting, setFollowUpModalDrawerExiting] =
    useState(false);
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
                    onClick={() => {
                      setStatsClickedCount(count => {
                        const updatedCount = count + 1;
                        if (updatedCount === 10) {
                          openModal({
                            title: "post viewers",
                            children: <PostViewersModalBody {...{ post }} />,
                          });
                          return 0;
                        }
                        return updatedCount;
                      });
                    }}
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
            <ShareMenuItem {...{ post }} />
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

interface ShareMenuItemProps {
  post: WorldPost;
}

const ShareMenuItem: FC<ShareMenuItemProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const { trigger, mutating } = useRouteMutation<{ share: PostShare }>(
    routes.worldPosts.share,
    {
      params: {
        id: post.id,
      },
      descriptor: "share post",
      onSuccess: ({ share }) => {
        const shareData: ShareData = {
          text: share.share_snippet,
        };
        if (navigator.canShare(shareData)) {
          void navigator.share(shareData);
        } else {
          void navigator.clipboard.writeText(share.share_snippet).then(() => {
            setCopied(true);
            toast.success("copied post snippet");
          });
        }
      },
    },
  );

  return (
    <Menu.Item
      leftSection={
        mutating ? (
          <Loader size="xs" />
        ) : copied ? (
          <CopiedIcon />
        ) : (
          <ShareIcon />
        )
      }
      closeMenuOnClick={false}
      onClick={() => {
        void trigger();
      }}
    >
      share post
    </Menu.Item>
  );
};

interface PostViewersModalBodyProps {
  post: WorldPost;
}

const PostViewersModalBody: FC<PostViewersModalBodyProps> = ({ post }) => {
  const { data } = useRouteSWR<{ viewers: FriendProfile[] }>(
    routes.worldPosts.viewers,
    {
      params: {
        id: post.id,
      },
      descriptor: "load post viewers",
    },
  );
  const { viewers } = data ?? {};
  return (
    <Stack>
      {viewers ? (
        isEmpty(viewers) ? (
          <EmptyCard itemLabel="viewers" />
        ) : (
          <List size="sm">
            {viewers.map(viewer => (
              <List.Item key={viewer.id} icon={viewer.emoji}>
                {viewer.name}
              </List.Item>
            ))}
          </List>
        )
      ) : (
        <List>
          {[...new Array(3)].map((_, index) => (
            <Skeleton key={index}>
              <List.Item>placeholder</List.Item>
            </Skeleton>
          ))}
        </List>
      )}
    </Stack>
  );
};
