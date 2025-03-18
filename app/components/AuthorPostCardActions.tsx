import { mutatePosts } from "~/helpers/posts";
import { type Post } from "~/types";

import DeleteButton from "./DeleteButton";

import classes from "./AuthorPostCardActions.module.css";

export interface AuthorPostCardActionsProps {
  post: Post;
}

const AuthorPostCardActions: FC<AuthorPostCardActionsProps> = ({ post }) => {
  return (
    <Group justify="end" gap={2}>
      <DeletePostButton postId={post.id} />
    </Group>
  );
};

export default AuthorPostCardActions;

interface DeletePostButtonProps {
  postId: string;
}

const DeletePostButton: FC<DeletePostButtonProps> = ({ postId }) => {
  const currentUser = useAuthenticatedUser();
  const { trigger, mutating } = useRouteMutation(routes.posts.destroy, {
    params: { id: postId },
    descriptor: "delete post",
    onSuccess: () => {
      void mutatePosts(currentUser.id);
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
