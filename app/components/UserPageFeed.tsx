import { useUserPagePosts } from "~/helpers/userPages";
import { type UserPageProps } from "~/pages/UserPage";

import EncouragementCard from "./EncouragementCard";
import FriendPostCardActions from "./FriendPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";

export interface UserPageFeedProps extends BoxProps {}

const UserPageFeed: FC<UserPageFeedProps> = props => {
  const { currentFriend, user, replyPhoneNumber, lastSentEncouragement } =
    usePageProps<UserPageProps>();
  const { post_id } = useQueryParams();

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useUserPagePosts(
    user.id,
  );
  const longerThan24HoursSinceLastPost = useMemo(() => {
    const lastPost = first(posts);
    if (!lastPost) {
      return true;
    }
    const timestamp = DateTime.fromISO(lastPost.created_at);
    return DateTime.now().diff(timestamp, "hours").hours > 24;
  }, [posts]);

  return (
    <Stack {...props}>
      {currentFriend &&
        user.active_features.includes("encouragements") &&
        (!!lastSentEncouragement || longerThan24HoursSinceLastPost) && (
          <EncouragementCard
            {...{
              currentFriend,
              user,
              lastSentEncouragement: lastSentEncouragement,
            }}
            onEncouragementCreated={() => {
              router.reload({
                only: ["lastSentEncouragement"],
                async: true,
              });
            }}
          />
        )}
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
