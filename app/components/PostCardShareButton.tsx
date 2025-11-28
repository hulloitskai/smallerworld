import { type ActionIconProps } from "@mantine/core";

import ShareIcon from "~icons/heroicons/arrow-up-on-square-20-solid";

import {
  type PostShare,
  type UniversePost,
  type UniversePostAssociatedFriend,
  type WorldPost,
  type WorldProfile,
} from "~/types";

import classes from "./PostCardShareButton.module.css";

export interface PostCardShareButtonProps extends ActionIconProps {
  world: WorldProfile;
  post: WorldPost | UniversePost;
  asFriend?: UniversePostAssociatedFriend;
}

const PostCardShareButton: FC<PostCardShareButtonProps> = ({
  world,
  post,
  asFriend,
  ...otherProps
}) => {
  const currentFriend = useCurrentFriend();
  const friend = asFriend ?? currentFriend;

  // == Share post
  const { trigger, mutating } = useRouteMutation<{
    share: PostShare;
  }>(routes.posts.share, {
    params: friend
      ? {
          id: post.id,
          query: {
            friend_token: friend.access_token,
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
          toast.warning(`you must be invited to ${world.name} to share posts`);
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
