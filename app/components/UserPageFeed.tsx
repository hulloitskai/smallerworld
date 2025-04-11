import { useUserPagePosts } from "~/helpers/userPages";
import { type User } from "~/types";

import FriendPostCardActions from "./FriendPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";

export interface UserPageFeedProps extends BoxProps {
  user: User;
  replyPhoneNumber: string | null;
}

const UserPageFeed: FC<UserPageFeedProps> = ({ user, replyPhoneNumber }) => {
  const currentFriend = useCurrentFriend();
  const { post_id } = useQueryParams();

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useUserPagePosts(
    user.id,
  );

  return (
    <Stack>
      {posts ? (
        isEmpty(posts) ? (
          <Card withBorder>
            <Stack justify="center" gap={2} ta="center" mih={60}>
              <Title order={4} lh="xs">
                no posts yet!
              </Title>
            </Stack>
          </Card>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                {...{ post }}
                blurContent={!currentFriend && post.visibility !== "public"}
                focus={post_id === post.id}
                actions={
                  <FriendPostCardActions
                    {...{ user, post, replyPhoneNumber }}
                  />
                }
              />
            ))}
            {hasMorePosts && (
              <LoadMoreButton
                loading={isValidating}
                style={{ alignSelf: "center" }}
                onVisible={() => {
                  void setSize(size => size + 1);
                }}
              />
            )}
          </>
        )
      ) : (
        [...new Array(3)].map((_, i) => <Skeleton key={i} h={120} />)
      )}
    </Stack>
  );
};

export default UserPageFeed;
