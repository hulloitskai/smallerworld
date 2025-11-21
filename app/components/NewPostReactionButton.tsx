import { confetti } from "@tsparticles/confetti";

import { particlePositionFor } from "~/helpers/particles";
import { type AssociatedFriend, type Post, type PostReaction } from "~/types";

import EmojiPopover from "./EmojiPopover";

import classes from "./NewPostReactionButton.module.css";

export interface NewPostReactionButtonProps {
  post: Post;
  hasExistingReactions: boolean;
  asFriend?: AssociatedFriend;
}

const NewPostReactionButton: FC<NewPostReactionButtonProps> = ({
  post,
  hasExistingReactions,
  asFriend,
}) => {
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();
  const friend = asFriend ?? currentFriend;
  const buttonRef = useRef<HTMLButtonElement>(null);

  // == Add reaction
  const { trigger: triggerAdd, mutating } = useRouteMutation<{
    reaction: PostReaction;
  }>(routes.postReactions.create, {
    descriptor: "react to post",
    params: {
      post_id: post.id,
      query: {
        ...(friend && {
          friend_token: friend.access_token,
        }),
      },
    },
    onSuccess: ({ reaction }) => {
      invariant(friend, "Missing friend");
      void mutateRoute<{ reactions: PostReaction[] }>(
        routes.postReactions.index,
        { post_id: post.id },
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
        if (!friend && !(currentUser && post.visibility === "public")) {
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
          className={classes.button}
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

export default NewPostReactionButton;
