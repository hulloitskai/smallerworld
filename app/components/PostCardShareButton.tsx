import { type ActionIconProps } from "@mantine/core";

import ShareIcon from "~icons/heroicons/arrow-up-on-square-20-solid";

import { type Author, type PostShare, type UserPost } from "~/types";

import classes from "./PostCardShareButton.module.css";

export interface PostCardShareButtonProps extends ActionIconProps {
  post: UserPost;
  author: Author;
}

const PostCardShareButton: FC<PostCardShareButtonProps> = ({
  post,
  author,
  ...otherProps
}) => {
  const currentFriend = useCurrentFriend();

  // == Share post
  const { trigger, mutating } = useRouteMutation<{
    share: PostShare;
  }>(routes.posts.share, {
    params: currentFriend
      ? {
          id: post.id,
          query: {
            friend_token: currentFriend.access_token,
          },
        }
      : null,
    descriptor: "share post",
    onSuccess: ({ share }) => {
      const shareData: ShareData = { text: share.share_snippet };
      const copyToClipboard = () => {
        void navigator.clipboard.writeText(share.share_snippet);
        toast.success("share snippet copied to clipboard!");
      };
      if (navigator.canShare(shareData)) {
        void navigator.share(shareData).then(undefined, reason => {
          if (reason instanceof Error && reason.name === "AbortError") {
            copyToClipboard();
          }
        });
      } else {
        copyToClipboard();
      }
    },
  });

  return (
    <ActionIcon
      className={classes.button}
      variant="subtle"
      size="sm"
      loading={mutating}
      onClick={() => {
        if (!currentFriend) {
          toast.warning(
            <>
              you must be invited to {possessive(author.name)} world to share
              posts
            </>,
          );
        } else {
          void trigger();
        }
      }}
      {...otherProps}
    >
      <ShareIcon />
    </ActionIcon>
  );
};

export default PostCardShareButton;
