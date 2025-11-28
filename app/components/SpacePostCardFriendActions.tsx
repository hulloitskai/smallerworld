import { useInViewport, useMergedRef } from "@mantine/hooks";
import { groupBy } from "lodash-es";

import { useTrackPostSeen } from "~/helpers/posts";
import {
  type PostReaction,
  type SpacePost,
  type UniversePostAssociatedFriend,
} from "~/types";

import NewPostReactionButton from "./NewPostReactionButton";
import PostReactionButton from "./PostReactionButton";

export interface SpacePostCardFriendActionsProps
  extends Omit<BoxProps, "children"> {
  post: SpacePost;
  asFriend?: UniversePostAssociatedFriend;
}

const SpacePostCardFriendActions: FC<SpacePostCardFriendActionsProps> = ({
  post,
  asFriend,
  className,
  ...otherProps
}) => {
  const { ref: viewportRef, inViewport } = useInViewport();

  // == Track views
  const trackSeenRef = useTrackPostSeen(post, {
    skip: "seen" in post ? post.seen : undefined,
    asFriend,
  });

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

  const mergedRef = useMergedRef(viewportRef, trackSeenRef);
  return (
    <Group
      ref={mergedRef}
      align="start"
      gap={2}
      wrap="wrap"
      className={cn("FriendPostCardActions", className)}
      {...otherProps}
    >
      <Group gap={2} wrap="wrap" style={{ flexGrow: 1, rowGap: 0 }}>
        {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
          <PostReactionButton
            key={emoji}
            {...{ post }}
            {...{ emoji, reactions }}
            {...{ asFriend }}
          />
        ))}
      </Group>
      <Group justify="end" gap={2} style={{ flexGrow: 1 }}>
        <NewPostReactionButton
          {...{ post }}
          friendTokenOverride={asFriend?.access_token}
          hasExistingReactions={!isEmpty(reactions)}
        />
      </Group>
    </Group>
  );
};

export default SpacePostCardFriendActions;
