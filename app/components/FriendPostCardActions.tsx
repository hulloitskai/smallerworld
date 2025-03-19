import { Text } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { groupBy } from "lodash-es";

import ReplyIcon from "~icons/heroicons/chat-bubble-oval-left-20-solid";

import { type Post, type PostReaction } from "~/types";

import EmojiPopover from "./EmojiPopover";

import classes from "./FriendPostCardActions.module.css";
import postCardClasses from "./PostCard.module.css";

interface FriendPostCardActionsProps {
  post: Post;
  replyPhoneNumber: string | null;
}

const FriendPostCardActions: FC<FriendPostCardActionsProps> = ({
  post,
  replyPhoneNumber,
}) => {
  const { ref, inViewport } = useInViewport();

  // == Load reactions
  const { data } = useRouteSWR<{ reactions: PostReaction[] }>(
    routes.postReactions.index,
    {
      params: inViewport ? { post_id: post.id } : null,
      descriptor: "load reactions",
      isVisible: () => inViewport,
    },
  );
  const { reactions } = data ?? {};
  const reactionsByEmoji = useMemo(
    () => groupBy(reactions, "emoji"),
    [reactions],
  );

  // == Reply via sms
  const replyUri = useMemo(() => {
    if (replyPhoneNumber) {
      const encodedBody = encodeURIComponent(post.reply_snippet);
      return `sms:${replyPhoneNumber}?body=${encodedBody}`;
    }
  }, [replyPhoneNumber, post.reply_snippet]);

  return (
    <Group {...{ ref }} gap={2}>
      <Group gap={2} wrap="wrap">
        {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
          <ReactionButton
            key={emoji}
            postId={post.id}
            {...{ emoji, reactions }}
          />
        ))}
        <NewReactionButton
          postId={post.id}
          hasExistingReactions={!isEmpty(reactions)}
        />
      </Group>
      <Text inline fz="lg" className={postCardClasses.divider}>
        /
      </Text>
      <Button
        component="a"
        href={replyUri}
        variant="subtle"
        size="compact-xs"
        leftSection={<ReplyIcon />}
        onClick={() => {
          if (!replyPhoneNumber) {
            toast.warning("you must be invited to this page to reply via sms");
          }
        }}
      >
        reply via sms
      </Button>
    </Group>
  );
};

export default FriendPostCardActions;

interface NewReactionButtonProps {
  postId: string;
  hasExistingReactions: boolean;
}

const NewReactionButton: FC<NewReactionButtonProps> = ({
  postId,
  hasExistingReactions,
}) => {
  const currentFriend = useCurrentFriend();
  const { trigger: addReaction } = useRouteMutation<{ reaction: PostReaction }>(
    routes.postReactions.create,
    {
      descriptor: "react to post",
      params: currentFriend
        ? {
            post_id: postId,
            query: {
              friend_token: currentFriend.access_token,
            },
          }
        : null,
      onSuccess: () => {
        mutateRoute(routes.postReactions.index, { post_id: postId });
      },
    },
  );

  return (
    <EmojiPopover
      pickerProps={{
        reactionsDefaultOpen: !hasExistingReactions,
        reactions: [
          "2764-fe0f",
          "1f97a",
          "1f60d",
          "1f62d",
          "1f604",
          "203c-fe0f",
        ],
      }}
      onEmojiClick={({ emoji }) => {
        if (!currentFriend) {
          toast.warning(
            "you must be invited to this page to react to this post",
          );
          return;
        }
        void addReaction({ reaction: { emoji } });
      }}
    >
      {({ open, opened }) => (
        <Button
          className={classes.newReactionButton}
          variant="subtle"
          size="compact-xs"
          leftSection={<EmojiIcon />}
          onClick={open}
          mod={{ opened }}
        >
          react
        </Button>
      )}
    </EmojiPopover>
  );
};

interface ReactionButtonProps {
  postId: string;
  emoji: string;
  reactions: PostReaction[];
}

const ReactionButton: FC<ReactionButtonProps> = ({
  postId,
  emoji,
  reactions,
}) => {
  const currentFriend = useCurrentFriend();
  const currentReaction = useMemo(
    () =>
      currentFriend?.id
        ? reactions.find(reaction => reaction.friend_id === currentFriend.id)
        : null,
    [reactions, currentFriend?.id],
  );
  const [mutating, setMutating] = useState(false);

  return (
    <Button
      variant={currentReaction ? "light" : "subtle"}
      leftSection={emoji}
      size="compact-xs"
      loading={mutating}
      className={classes.reactionButton}
      onClick={() => {
        if (!currentFriend) {
          toast.warning(
            "you must be invited to this page to react to this post",
          );
          return;
        }
        setMutating(true);
        const action = currentReaction
          ? fetchRoute(routes.postReactions.destroy, {
              params: {
                id: currentReaction.id,
                query: {
                  friend_token: currentFriend.access_token,
                },
              },
              descriptor: "remove reaction",
            })
          : fetchRoute(routes.postReactions.create, {
              params: {
                post_id: postId,
                query: {
                  friend_token: currentFriend.access_token,
                },
              },
              descriptor: "react to post",
              data: {
                reaction: {
                  emoji,
                },
              },
            });
        void action
          .then(() => {
            mutateRoute(routes.postReactions.index, { post_id: postId });
          })
          .finally(() => {
            setMutating(false);
          });
      }}
    >
      {reactions.length}
    </Button>
  );
};
