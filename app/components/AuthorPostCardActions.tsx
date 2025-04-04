import { useInViewport } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { groupBy } from "lodash-es";

import FollowUpIcon from "~icons/heroicons/arrow-path-rounded-square-20-solid";
import ActionsIcon from "~icons/heroicons/pencil-square-20-solid";

import { mutatePosts, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Post, type PostReaction } from "~/types";

import DrawerModal from "./DrawerModal";
import PostForm from "./PostForm";

import classes from "./AuthorPostCardActions.module.css";

export interface AuthorPostCardActionsProps {
  post: Post;
  onFollowUpDrawerModalOpened?: () => void;
}

const AuthorPostCardActions: FC<AuthorPostCardActionsProps> = ({
  post,
  onFollowUpDrawerModalOpened,
}) => {
  const { ref, inViewport } = useInViewport();

  // == Load post stats
  const { data: statsData } = useRouteSWR<{ notifiedFriends: number }>(
    routes.posts.stats,
    {
      descriptor: "load post stats",
      params: inViewport ? { id: post.id } : null,
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
        <Menu width={165}>
          <Menu.Target>
            <Button
              variant="subtle"
              size="compact-xs"
              leftSection={<ActionsIcon />}
              loading={deleting}
            >
              actions
            </Button>
          </Menu.Target>
          <Menu.Dropdown style={{ pointerEvents: "auto" }}>
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
                    void triggerDelete();
                  },
                });
              }}
            >
              delete post
            </Menu.Item>
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
