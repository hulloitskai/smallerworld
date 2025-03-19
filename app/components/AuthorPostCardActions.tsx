import { useInViewport } from "@mantine/hooks";
import { groupBy } from "lodash-es";

import { mutatePosts, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Post, type PostReaction } from "~/types";

import DeleteButton from "./DeleteButton";
import PostForm from "./PostForm";

import classes from "./AuthorPostCardActions.module.css";

export interface AuthorPostCardActionsProps {
  post: Post;
}

const AuthorPostCardActions: FC<AuthorPostCardActionsProps> = ({ post }) => {
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
      params: {
        post_id: post.id,
      },
      descriptor: "load reactions",
      isVisible: () => inViewport,
    },
  );
  const { reactions } = reactionsData ?? {};
  const reactionsByEmoji = useMemo(
    () => groupBy(reactions, "emoji"),
    [reactions],
  );

  return (
    <Group {...{ ref }} justify="space-between" gap={2}>
      {!!notifiedFriends && (
        <Badge
          variant="transparent"
          leftSection={<NotificationIcon />}
          className={classes.notifiedBadge}
        >
          {notifiedFriends} notified
        </Badge>
      )}
      <Group gap={2} wrap="wrap" style={{ flexGrow: 1 }}>
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
      <Group gap={2}>
        <EditPostButton {...{ post }} />
        <DeletePostButton postId={post.id} />
      </Group>
    </Group>
  );
};

export default AuthorPostCardActions;

interface DeletePostButtonProps {
  postId: string;
}

const DeletePostButton: FC<DeletePostButtonProps> = ({ postId }) => {
  const { trigger, mutating } = useRouteMutation(routes.posts.destroy, {
    params: { id: postId },
    descriptor: "delete post",
    onSuccess: () => {
      void mutatePosts();
    },
  });

  return (
    <DeleteButton
      className={classes.deleteButton}
      loading={mutating}
      variant="subtle"
      color="gray"
      size="compact-xs"
      onConfirm={() => {
        void trigger();
      }}
    />
  );
};

interface EditPostButtonProps {
  post: Post;
}

const EditPostButton: FC<EditPostButtonProps> = ({ post }) => {
  return (
    <Button
      variant="subtle"
      color="gray"
      size="compact-xs"
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
      edit
    </Button>
  );
};
