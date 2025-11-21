import { type ActionIconProps } from "@mantine/core";

import { useWorldPosts, type WorldPageProps } from "~/helpers/worlds";

export interface WorldPageRefreshButtonProps
  extends Omit<ActionIconProps, "children"> {}

const WorldPageRefreshButton: FC<WorldPageRefreshButtonProps> = ({
  ...otherProps
}) => {
  const { currentFriend, world } = usePageProps<WorldPageProps>();
  const [loading, setLoading] = useState(false);

  // == Revalidate posts
  const {
    mutate: mutatePosts,
    isValidating,
    posts,
  } = useWorldPosts(world.id, {
    revalidateOnMount: false,
  });

  return (
    <ActionIcon
      variant="light"
      size="lg"
      loading={loading || isValidating}
      onClick={() => {
        // Reload page data
        setLoading(true);
        router.reload({
          only: [
            "currentUser",
            "currentFriend",
            "user",
            "world",
            "lastSentEncouragement",
            "invitationRequested",
          ],
          async: true,
          onFinish: () => {
            setLoading(false);
          },
        });

        // Reload pinned posts and activity coupons
        const query = currentFriend
          ? { friend_token: currentFriend.access_token }
          : {};
        void mutateRoute(routes.worldPosts.pinned, {
          world_id: world.id,
          query,
        });
        void mutateRoute(routes.worldActivityCoupons.index, {
          world_id: world.id,
          query,
        });

        // Revalidate posts and post stats, reactions, etc
        const firstPost = first(posts);
        void mutatePosts().then(pages => {
          const latestFirstPage = first(pages);
          const latestFirstPost = first(latestFirstPage?.posts);
          if (
            firstPost &&
            latestFirstPost &&
            firstPost.id === latestFirstPost.id
          ) {
            toast.success("no new posts", {
              description: "you're all caught up :)",
            });
          }
        });
      }}
      {...otherProps}
    >
      <RefreshIcon />
    </ActionIcon>
  );
};

export default WorldPageRefreshButton;
