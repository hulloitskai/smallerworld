import { Text } from "@mantine/core";
import { useInViewport, useMergedRef } from "@mantine/hooks";
import { groupBy } from "lodash-es";

import { useTrackPostSeen } from "~/helpers/posts";
import { type PostReaction, type SpacePost } from "~/types";

import NewPostReactionButton from "./NewPostReactionButton";
import PostReactionButton from "./PostReactionButton";
import SpacePostCardReplyButton from "./SpacePostCardReplyButton";

import postCardClasses from "./PostCard.module.css";

export interface SpacePostCardFriendActionsProps
  extends Omit<BoxProps, "children"> {
  post: SpacePost;
}

const SpacePostCardFriendActions: FC<SpacePostCardFriendActionsProps> = ({
  post,
  className,
  ...otherProps
}) => {
  const { ref: viewportRef, inViewport } = useInViewport();
  const currentUser = useCurrentUser();

  // == Track views
  const trackSeenRef = useTrackPostSeen(post, {
    skip: "seen" in post ? post.seen : undefined,
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
          />
        ))}
      </Group>
      <Group justify="end" gap={2} style={{ flexGrow: 1 }}>
        <NewPostReactionButton
          {...{ post }}
          hasExistingReactions={!isEmpty(reactions)}
        />
        {(!currentUser || !!post.reply_to_number) && (
          <>
            <Text className={postCardClasses.actionSeparator}>/</Text>
            <SpacePostCardReplyButton
              {...{ post }}
              replyToNumber={post.reply_to_number}
            />
          </>
        )}
      </Group>
    </Group>
  );
};

export default SpacePostCardFriendActions;
