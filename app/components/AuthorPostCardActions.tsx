import { CopyButton } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { groupBy } from "lodash-es";

import FollowUpIcon from "~icons/heroicons/arrow-path-rounded-square-20-solid";
import ActionsIcon from "~icons/heroicons/pencil-square-20-solid";

import { mutatePosts, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Post, type PostReaction, type User } from "~/types";

import DrawerModal from "./DrawerModal";
import PostForm, { type PostFormProps } from "./PostForm";

import classes from "./AuthorPostCardActions.module.css";

export interface AuthorPostCardActionsProps
  extends Pick<PostFormProps, "pausedFriends"> {
  user: User;
  post: Post;
  hideStats: boolean;
  onFollowUpDrawerModalOpened?: () => void;
}

const AuthorPostCardActions: FC<AuthorPostCardActionsProps> = ({
  user,
  post,
  hideStats,
  pausedFriends,
  onFollowUpDrawerModalOpened,
}) => {
  const postUrl = usePostUrl(post, user);
  const { ref, inViewport } = useInViewport();

  // == Load post stats
  const { data: statsData } = useRouteSWR<{ notifiedFriends: number }>(
    routes.posts.stats,
    {
      descriptor: "load post stats",
      params: !hideStats && inViewport ? { id: post.id } : null,
      keepPreviousData: true,
      refreshInterval: 5000,
      isVisible: () => inViewport,
    },
  );
  const { notifiedFriends } = statsData ?? {};

  // == Load reactions
  const { data: reactionsData } = useRouteSWR<{ reactions: PostReaction[] }>(
    routes.postReactions.index,
    {
      params: inViewport ? { post_id: post.id } : null,
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

  // == Delete post mutation
  const { trigger: triggerDelete, mutating: deleting } = useRouteMutation(
    routes.posts.destroy,
    {
      params: { id: post.id },
      descriptor: "delete post",
      onSuccess: () => {
        void mutatePosts();
        void mutateRoute(routes.posts.pinned);
        void mutateRoute(routes.encouragements.index);
      },
    },
  );

  // == Follow-up drawer modal
  const [followUpOpened, setFollowUpOpened] = useState(false);

  return (
    <>
      <Group {...{ ref }} align="start" justify="space-between" gap={2}>
        {!!notifiedFriends && (
          <Badge
            variant="transparent"
            leftSection={<NotificationIcon />}
            className={classes.notifiedBadge}
          >
            {notifiedFriends} notified
          </Badge>
        )}
        <Group gap={2} wrap="wrap" style={{ flexGrow: 1, rowGap: 0 }}>
          {Object.entries(reactionsByEmoji).map(([emoji, reactions]) =>
            hideStats ? (
              <Badge
                key={emoji}
                variant="transparent"
                color="gray"
                className={classes.reactionBadgeWithoutCounts}
              >
                {emoji}
              </Badge>
            ) : (
              <Badge
                key={emoji}
                variant="transparent"
                color="gray"
                leftSection={emoji}
                className={classes.reactionBadge}
              >
                {reactions.length}
              </Badge>
            ),
          )}
        </Group>
        <Menu width={165}>
          <Menu.Target>
            <Button
              variant="subtle"
              size="compact-xs"
              leftSection={<ActionsIcon />}
              loading={deleting}
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
                      {...{ post, pausedFriends }}
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
                    void triggerDelete();
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
                setFollowUpOpened(true);
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
        opened={followUpOpened}
        onClose={() => {
          setFollowUpOpened(false);
        }}
      >
        <PostForm
          {...{ pausedFriends }}
          postType="follow_up"
          quotedPost={post}
          onPostCreated={() => {
            setFollowUpOpened(false);
          }}
        />
      </DrawerModal>
    </>
  );
};

export default AuthorPostCardActions;

const usePostUrl = (post: Post, user: User): string | undefined => {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const path = routes.users.show.path({
      handle: user.handle,
      query: {
        post_id: post.id,
      },
    });
    const url = new URL(path, window.location.origin);
    setUrl(url.toString());
  }, [user.handle, post.id]);
  return url;
};
