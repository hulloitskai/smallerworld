// import { ActionIcon } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";

import { mutatePosts } from "~/helpers/posts";
import { type Post } from "~/types";

import DeleteButton from "./DeleteButton";

import classes from "./AuthorPostCardActions.module.css";

export interface AuthorPostCardActionsProps {
  post: Post;
}

const AuthorPostCardActions: FC<AuthorPostCardActionsProps> = ({ post }) => {
  const { ref, inViewport } = useInViewport();
  const { data } = useRouteSWR<{ notifiedFriends: number }>(
    routes.posts.stats,
    {
      descriptor: "load post stats",
      params: inViewport ? { id: post.id } : null,
      refreshInterval: 5000,
      isVisible: () => inViewport,
    },
  );
  const { notifiedFriends } = data ?? {};

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
      <DeletePostButton postId={post.id} />
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
