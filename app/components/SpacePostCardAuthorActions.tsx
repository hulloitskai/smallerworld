import { Text } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { groupBy } from "lodash-es";

import ActionsIcon from "~icons/heroicons/pencil-square-20-solid";

import { POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { mutateRoute } from "~/helpers/routes/swr";
import { mutateSpacePosts } from "~/helpers/spaces";
import { type Post, type PostReaction, type Space } from "~/types";

import SpacePostForm from "./SpacePostForm";

import postCardClasses from "./PostCard.module.css";
import classes from "./WorldPostCardAuthorActions.module.css";

export interface SpacePostCardAuthorActionsProps
  extends Omit<BoxProps, "children"> {
  space: Space;
  post: Post;
  onEditModalOpened?: () => void;
}

const SpacePostCardAuthorActions: FC<SpacePostCardAuthorActionsProps> = ({
  space,
  post,
  onEditModalOpened,
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

  // == Delete post
  const { trigger: deletePost, mutating: deletingPost } = useRouteMutation<{
    spaceId: string;
  }>(routes.spacePosts.destroy, {
    params: {
      id: post.id,
    },
    descriptor: "delete post",
    onSuccess: () => {
      void mutateSpacePosts(space.id);
      void mutateRoute(routes.spacePosts.pinned, { space_id: space.id });
    },
  });

  return (
    <Group
      {...{ ref }}
      align="start"
      gap={3}
      className={cn("AuthorPostCardActions", className)}
      {...otherProps}
    >
      <Group gap={2} wrap="wrap" style={{ flexGrow: 1, rowGap: 0 }}>
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
      {!isEmpty(reactions) && (
        <Text className={postCardClasses.actionSeparator}>/</Text>
      )}
      <Menu width={150}>
        <Menu.Target>
          <Button
            variant="subtle"
            size="compact-xs"
            leftSection={<ActionsIcon />}
            loading={deletingPost}
            style={{ flexShrink: 0 }}
          >
            actions
          </Button>
        </Menu.Target>
        <Menu.Dropdown style={{ pointerEvents: "auto" }}>
          <Menu.Item
            leftSection={<EditIcon />}
            onClick={() => {
              onEditModalOpened?.();
              const modalId = randomId();
              openModal({
                modalId,
                title: <>edit {POST_TYPE_TO_LABEL[post.type]}</>,
                size: "var(--container-size-xs)",
                children: (
                  <SpacePostForm
                    spaceId={space.id}
                    {...{ post }}
                    onPostUpdated={() => {
                      closeModal(modalId);
                    }}
                  />
                ),
              });
            }}
          >
            edit post
          </Menu.Item>
          <Menu.Item
            leftSection={<DeleteIcon />}
            onClick={() => {
              openConfirmModal({
                title: "really delete post?",
                children: <>you can't undo this action</>,
                cancelProps: { variant: "light", color: "gray" },
                groupProps: { gap: "xs" },
                labels: {
                  confirm: "do it",
                  cancel: "wait nvm",
                },
                styles: {
                  header: {
                    minHeight: 0,
                    paddingBottom: 0,
                  },
                },
                onConfirm: () => {
                  void deletePost();
                },
              });
            }}
          >
            delete post
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default SpacePostCardAuthorActions;
