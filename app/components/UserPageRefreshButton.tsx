import { mutate } from "swr";

import { useUserPagePosts } from "~/helpers/userPages";

export interface UserPageRefreshButtonProps extends BoxProps {
  userId: string;
}

const UserPageRefreshButton: FC<UserPageRefreshButtonProps> = ({
  userId,
  ...otherProps
}) => {
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
      color="gray"
      size="lg"
      loading={isValidating}
      onClick={() => {
        const firstPost = first(posts);
        void mutate((key: string) => {
          if (typeof key === "string") {
            return key.startsWith("/posts");
          }
        });
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
