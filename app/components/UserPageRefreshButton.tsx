import { mutate } from "swr";

import { useUserPagePosts } from "~/helpers/userPages";

export interface UserPageRefreshButtonProps extends BoxProps {
  userId: string;
}

const UserPageRefreshButton: FC<UserPageRefreshButtonProps> = ({
  userId,
  ...otherProps
}) => {
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
        void mutateRoute(routes.userPosts.pinned);
        void mutateRoute(routes.activityCoupons.index);

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
        void mutatePostStatsAndReactions();
      }}
      {...otherProps}
    >
      <RefreshIcon />
    </ActionIcon>
  );
};

export default UserPageRefreshButton;

const mutatePostStatsAndReactions = async (): Promise<void> => {
  await mutate((key: string) => {
    if (typeof key === "string") {
      return key.startsWith("/posts");
    }
  });
};
