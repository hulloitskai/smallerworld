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
  const { posts, hasMorePosts, setSize } = useUserPagePosts(user.id);
  const [loadingMore, setLoadingMore] = useState(false);
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
                loading={loadingMore}
                style={{ alignSelf: "center" }}
                onVisible={() => {
                  setLoadingMore(true);
                  void setSize(size => size + 1).finally(() => {
                    setLoadingMore(false);
                  });
                }}
              />
            )}
          </>
        )
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [...new Array(3)].map((_, i) => <Skeleton key={i} h={120} />)
      )}
    </Stack>
  );
};

export default UserPageFeed;
