import { Text } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { groupBy } from "lodash-es";

import {
  confetti,
  particlePositionFor,
  puffOfSmoke,
} from "~/helpers/particles";
import { type AssociatedFriend, type PostReaction } from "~/types";

import EmojiPopover from "./EmojiPopover";
import PostCardReplyButton, {
  type PostCardReplyButtonProps,
} from "./PostCardReplyButton";
import PostCardShareButton from "./PostCardShareButton";

import classes from "./FriendPostCardActions.module.css";
import postCardClasses from "./PostCard.module.css";

export interface FriendPostCardActionsProps
  extends Omit<BoxProps, "children">,
    Pick<PostCardReplyButtonProps, "post" | "world" | "replyToNumber"> {
  asFriend?: AssociatedFriend;
}

const FriendPostCardActions: FC<FriendPostCardActionsProps> = ({
  post,
  world,
  replyToNumber,
  asFriend,
  className,
  ...otherProps
}) => {
  const { ref, inViewport } = useInViewport();

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

  return (
    <Group
      {...{ ref }}
      align="start"
      gap={2}
      wrap="wrap"
      className={cn("FriendPostCardActions", className)}
      {...otherProps}
    >
      <Group gap={2} wrap="wrap" style={{ flexGrow: 1 }}>
        {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
          <ReactionButton
            key={emoji}
            postId={post.id}
            {...{ emoji, reactions, asFriend }}
          />
        ))}
      </Group>
      <Group justify="end" gap={2} style={{ flexGrow: 1 }}>
        {/* {user.supported_features.includes("stickers") ? (
              <Button
                variant="subtle"
                size="compact-xs"
                leftSection={<StickerIcon />}
                style={{ flexShrink: 0 }}
                onClick={() => {
                  if (!currentFriend) {
                    toast.warning(
                      <>
                        you must be invited to {possessive(user.name)} world to
                        add stickers
                      </>,
                    );
                    return;
                  }
                  setShowStickerDrawer(true);
                }}
              >
                add sticker
              </Button>
            ) : (
              <NewReactionButton
                postId={post.id}
                hasExistingReactions={!isEmpty(reactions)}
              />
            )} */}
        <NewReactionButton
          postId={post.id}
          hasExistingReactions={!isEmpty(reactions)}
          {...{ asFriend }}
        />
        <Text className={postCardClasses.actionSeparator}>/</Text>
        <PostCardReplyButton {...{ world, post, replyToNumber, asFriend }} />
        {world.allow_friend_sharing && (
          <>
            <Text className={postCardClasses.actionSeparator}>/</Text>
            <PostCardShareButton {...{ world, post }} />
          </>
        )}
      </Group>
    </Group>
  );
};

export default FriendPostCardActions;

interface NewReactionButtonProps {
  postId: string;
  hasExistingReactions: boolean;
  asFriend?: AssociatedFriend;
}

const NewReactionButton: FC<NewReactionButtonProps> = ({
  postId,
  hasExistingReactions,
  asFriend,
}) => {
  const currentFriend = useCurrentFriend();
  const friend = asFriend ?? currentFriend;
  const buttonRef = useRef<HTMLButtonElement>(null);

  // == Add reaction
  const { trigger: triggerAdd, mutating } = useRouteMutation<{
    reaction: PostReaction;
  }>(routes.postReactions.create, {
    descriptor: "react to post",
    params: friend
      ? {
          post_id: postId,
          query: {
            friend_token: friend.access_token,
          },
        }
      : null,
    onSuccess: ({ reaction }) => {
      invariant(friend, "Missing friend");
      void mutateRoute<{ reactions: PostReaction[] }>(
        routes.postReactions.index,
        { post_id: postId },
        undefined,
        {
          optimisticData: currentData => {
            const { reactions = [] } = currentData ?? {};
            return { reactions: [...reactions, reaction] };
          },
        },
      );
    },
  });

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
        if (!friend) {
          toast.warning(
            "you must be invited to this page to react to this post",
          );
          return;
        }
        void triggerAdd({ reaction: { emoji } });

        const button = buttonRef.current;
        if (!button) {
          return;
        }
        void confetti({
          position: particlePositionFor(button),
          spread: 200,
          ticks: 60,
          gravity: 1,
          startVelocity: 18,
          count: 8,
          scalar: 2,
          shapes: ["emoji"],
          shapeOptions: {
            emoji: {
              value: emoji,
            },
          },
        });
      }}
    >
      {({ open, opened }) => (
        <Button
          ref={buttonRef}
          className={classes.newReactionButton}
          variant="subtle"
          size="compact-xs"
          leftSection={<EmojiIcon />}
          loading={mutating}
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
  asFriend?: AssociatedFriend;
}

const ReactionButton: FC<ReactionButtonProps> = ({
  postId,
  emoji,
  reactions,
  asFriend,
}) => {
  const currentFriend = useCurrentFriend();
  const friend = asFriend ?? currentFriend;
  const currentReaction = useMemo(
    () =>
      friend?.id
        ? reactions.find(reaction => reaction.friend_id === friend.id)
        : null,
    [reactions, friend?.id],
  );
  const [mutating, setMutating] = useState(false);

  return (
    <Button
      variant={currentReaction ? "light" : "subtle"}
      leftSection={emoji}
      size="compact-xs"
      loading={mutating}
      className={classes.reactionButton}
      onClick={({ currentTarget }) => {
        if (!friend) {
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
                  friend_token: friend.access_token,
                },
              },
              descriptor: "remove reaction",
            }).then(() => {
              void mutateRoute<{ reactions: PostReaction[] }>(
                routes.postReactions.index,
                { post_id: postId },
                undefined,
                {
                  optimisticData: currentData => {
                    const { reactions = [] } = currentData ?? {};
                    return {
                      reactions: reactions.filter(
                        reaction => reaction.id !== currentReaction.id,
                      ),
                    };
                  },
                },
              );
            })
          : fetchRoute<{ reaction: PostReaction }>(
              routes.postReactions.create,
              {
                params: {
                  post_id: postId,
                  query: {
                    friend_token: friend.access_token,
                  },
                },
                descriptor: "react to post",
                data: {
                  reaction: {
                    emoji,
                  },
                },
              },
            ).then(({ reaction }) => {
              void mutateRoute<{ reactions: PostReaction[] }>(
                routes.postReactions.index,
                { post_id: postId },
                undefined,
                {
                  optimisticData: currentData => {
                    const { reactions = [] } = currentData ?? {};
                    return { reactions: [...reactions, reaction] };
                  },
                },
              );
            });
        void action.finally(() => {
          setMutating(false);
        });
        if (currentReaction) {
          void puffOfSmoke({
            position: particlePositionFor(currentTarget),
          });
        } else {
          void confetti({
            position: particlePositionFor(currentTarget),
            count: 8,
            spread: 200,
            ticks: 60,
            gravity: 1,
            startVelocity: 18,
            scalar: 2,
            shapes: ["emoji"],
            shapeOptions: {
              emoji: {
                value: emoji,
              },
            },
          });
        }
      }}
    >
      {reactions.length}
    </Button>
  );
};
