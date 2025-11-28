import {
  confetti,
  particlePositionFor,
  puffOfSmoke,
} from "~/helpers/particles";
import {
  type Post,
  type PostReaction,
  type UniversePostAssociatedFriend,
} from "~/types";

import classes from "./PostReactionButton.module.css";

export interface PostReactionButtonProps {
  post: Post;
  emoji: string;
  reactions: PostReaction[];
  asFriend?: UniversePostAssociatedFriend;
}

const PostReactionButton: FC<PostReactionButtonProps> = ({
  post,
  emoji,
  reactions,
  asFriend,
}) => {
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();
  const friend = asFriend ?? currentFriend;
  const currentReaction = useMemo(
    () =>
      friend
        ? reactions.find(
            reaction =>
              reaction.reactor_type === "Friend" &&
              reaction.reactor_id === friend.id,
          )
        : currentUser
          ? reactions.find(
              reaction =>
                reaction.reactor_type === "User" &&
                reaction.reactor_id === currentUser.id,
            )
          : null,
    [reactions, friend, currentUser],
  );
  const [mutating, setMutating] = useState(false);

  return (
    <Button
      variant={currentReaction ? "light" : "subtle"}
      leftSection={emoji}
      size="compact-xs"
      loading={mutating}
      className={classes.button}
      onClick={({ currentTarget }) => {
        if (!friend && !(currentUser && post.visibility === "public")) {
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
                  ...(friend && {
                    friend_token: friend.access_token,
                  }),
                },
              },
              descriptor: "remove reaction",
            }).then(() => {
              void mutateRoute<{ reactions: PostReaction[] }>(
                routes.postReactions.index,
                {
                  post_id: post.id,
                  query: {
                    ...(friend && {
                      friend_token: friend.access_token,
                    }),
                  },
                },
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
                  post_id: post.id,
                  query: {
                    ...(friend && {
                      friend_token: friend.access_token,
                    }),
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
                {
                  post_id: post.id,
                  query: {
                    ...(friend && {
                      friend_token: friend.access_token,
                    }),
                  },
                },
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

export default PostReactionButton;
