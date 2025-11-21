import { Text } from "@mantine/core";
import { useInViewport, useMergedRef } from "@mantine/hooks";
import { groupBy } from "lodash-es";

import { useTrackPostSeen } from "~/helpers/posts";
import { type AssociatedFriend, type PostReaction } from "~/types";

import NewPostReactionButton from "./NewPostReactionButton";
import PostCardReplyButton, {
  type PostCardReplyButtonProps,
} from "./PostCardReplyButton";
import PostCardShareButton from "./PostCardShareButton";
import PostReactionButton from "./PostReactionButton";

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
  const { ref: viewportRef, inViewport } = useInViewport();

  // == Track views
  const trackSeenRef = useTrackPostSeen(post, { skip: post.seen, asFriend });

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
            {...{ emoji, reactions, asFriend }}
          />
        ))}
      </Group>
      <Group justify="end" gap={2} style={{ flexGrow: 1 }}>
        <NewPostReactionButton
          {...{ post }}
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
