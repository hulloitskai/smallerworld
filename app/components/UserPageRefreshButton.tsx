import { type ActionIconProps } from "@mantine/core";

import { useUserPagePosts } from "~/helpers/userPages";
import { type UserPageProps } from "~/pages/UserPage";

export interface UserPageRefreshButtonProps
  extends Omit<ActionIconProps, "children"> {
  userId: string;
}

const UserPageRefreshButton: FC<UserPageRefreshButtonProps> = ({
  userId,
  ...otherProps
}) => {
  const { currentFriend } = usePageProps<UserPageProps>();
  const [loading, setLoading] = useState(false);

  // == Revalidate posts
  const {
    mutate: mutatePosts,
    isValidating,
    posts,
  } = useUserPagePosts(userId, {
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
            "faviconLinks",
            "user",
            "lastSentEncouragement",
            "invitationRequested",
            "hideNeko",
            "allowFriendSharing",
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
        void mutateRoute(routes.userPosts.pinned, { user_id: userId, query });
        void mutateRoute(routes.userActivityCoupons.index, {
          user_id: userId,
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

export default UserPageRefreshButton;
