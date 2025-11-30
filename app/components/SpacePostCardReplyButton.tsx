import { type ButtonProps } from "@mantine/core";

import { messageUri } from "~/helpers/messaging";
import { mutateWorldPosts } from "~/helpers/worlds";
import { type SpacePost, type UniversePostAssociatedFriend } from "~/types";

import classes from "./PostCardReplyButton.module.css";

export interface SpacePostCardReplyButtonProps extends ButtonProps {
  post: SpacePost;
  replyToNumber: string;
  asFriend?: UniversePostAssociatedFriend;
}

const SpacePostCardReplyButton: FC<SpacePostCardReplyButtonProps> = ({
  post,
  replyToNumber,
  asFriend,
  ...otherProps
}) => {
  const currentFriend = useCurrentFriend();
  const friend = asFriend ?? currentFriend;

  // == Mark as replied
  const { trigger: markReplied, mutating: markingReplied } = useRouteMutation<{
    worldId: string | null;
  }>(routes.posts.markReplied, {
    params: {
      id: post.id,
      query: {
        ...(friend && {
          friend_token: friend.access_token,
        }),
      },
    },
    descriptor: "mark post as replied",
    failSilently: true,
    onSuccess: ({ worldId }) => {
      if (worldId) {
        void mutateWorldPosts(worldId);
      }
    },
  });

  return (
    <Button
      component="a"
      className={classes.button}
      variant="subtle"
      size="compact-xs"
      loading={markingReplied}
      leftSection={
        <Box pos="relative">
          <ReplyIcon />
          {post.repliers > 0 && post.repliers < 40 && (
            <Center
              fz={post.repliers > 20 ? 7 : post.repliers > 10 ? 8 : 9}
              className={classes.repliersCount}
            >
              {post.repliers}
            </Center>
          )}
        </Box>
      }
      mod={{ replied: post.replied }}
      href={messageUri(replyToNumber, post.reply_snippet, "whatsapp")}
      onClick={() => {
        void markReplied();
      }}
      {...otherProps}
    >
      reply by whatsapp
    </Button>
  );
};

export default SpacePostCardReplyButton;
