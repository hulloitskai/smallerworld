import { useInViewport } from "@mantine/hooks";
import { groupBy } from "lodash-es";

import { type PostReaction } from "~/types";

import classes from "./PublicPostCardActions.module.css";

export interface PublicPostCardActionsProps {
  postId: string;
}

const PublicPostCardActions: FC<PublicPostCardActionsProps> = ({ postId }) => {
  const { ref, inViewport } = useInViewport();

  // == Load reactions
  const { data } = useRouteSWR<{ reactions: PostReaction[] }>(
    routes.postReactions.index,
    {
      params: { post_id: postId },
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

  return (
    <Group {...{ ref }} gap={2} wrap="wrap" style={{ flexGrow: 1, rowGap: 0 }}>
      {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
        <Badge
          key={emoji}
          variant="transparent"
          color="gray"
          leftSection={emoji}
          className={classes.reactionBadge}
        >
          {reactions.length}
        </Badge>
      ))}
    </Group>
  );
};

export default PublicPostCardActions;
