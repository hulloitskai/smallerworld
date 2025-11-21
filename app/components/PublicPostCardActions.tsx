import { useInViewport, useMergedRef } from "@mantine/hooks";
import { groupBy } from "lodash-es";

import { useTrackPostSeen } from "~/helpers/posts";
import { type PostReaction, type UserUniversePublicPost } from "~/types";
import type WorldPost from "~/types/WorldPost";

import NewPostReactionButton from "./NewPostReactionButton";
import PostReactionButton from "./PostReactionButton";

export interface PublicPostCardActionsProps extends Omit<BoxProps, "children"> {
  post: WorldPost | UserUniversePublicPost;
}

const PublicPostCardActions: FC<PublicPostCardActionsProps> = ({
  post,
  className,
  ...otherProps
}) => {
  const { ref: viewportRef, inViewport } = useInViewport();
  const currentFriend = useCurrentFriend();

  // == Track views
  const trackSeenRef = useTrackPostSeen(post, {
    skip: post.seen || (!currentFriend && post.visibility !== "public"),
  });

  // == Load reactions
  const { data } = useRouteSWR<{ reactions: PostReaction[] }>(
    routes.postReactions.index,
    {
      params: { post_id: post.id },
      descriptor: "load reactions",
      keepPreviousData: true,
      refreshInterval: 5000,
      isVisible: () => inViewport,
    },
  );
  const { reactions } = data ?? {};
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
          <PostReactionButton key={emoji} {...{ post, emoji, reactions }} />
        ))}
      </Group>
      <Group justify="end" gap={2} style={{ flexGrow: 1 }}>
        <NewPostReactionButton
          {...{ post }}
          hasExistingReactions={!isEmpty(reactions)}
        />
      </Group>
    </Group>
  );
};

export default PublicPostCardActions;
