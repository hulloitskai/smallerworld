import { useInViewport } from "@mantine/hooks";
import { type PropsWithChildren } from "react";

import { mutateUserPagePosts, useUserPagePosts } from "~/helpers/userPages";
import { type UserPageProps } from "~/pages/UserPage";
import { type UserPost } from "~/types";

import EncouragementCard from "./EncouragementCard";
import FriendPostCardActions from "./FriendPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";

export interface UserPageFeedProps extends BoxProps {}

const UserPageFeed: FC<UserPageFeedProps> = props => {
  const { currentFriend, user, replyToNumber, lastSentEncouragement } =
    usePageProps<UserPageProps>();
  const { post_id } = useQueryParams();

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useUserPagePosts(
    user.id,
  );
  const longerThan24HoursSinceLastPost = useMemo(() => {
    if (!posts) {
      return;
    }
    const [lastPost] = posts;
    if (!lastPost) {
      return true;
    }
    const timestamp = DateTime.fromISO(lastPost.created_at);
    return DateTime.now().diff(timestamp, "hours").hours > 24;
  }, [posts]);

  return (
    <Stack {...props}>
      {currentFriend &&
        user.supported_features.includes("encouragements") &&
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
              <TrackUserPostSeen key={post.id} {...{ post }}>
                <PostCard
                  {...{ post }}
                  blurContent={!currentFriend && post.visibility !== "public"}
                  focus={post_id === post.id}
                  actions={
                    <FriendPostCardActions {...{ user, post, replyToNumber }} />
                  }
                />
              </TrackUserPostSeen>
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

interface TrackUserPostSeenProps extends PropsWithChildren {
  post: UserPost;
}

const TrackUserPostSeen: FC<TrackUserPostSeenProps> = ({ post, children }) => {
  const { currentFriend } = usePageProps<UserPageProps>();
  const { ref, inViewport } = useInViewport<HTMLDivElement>();
  useEffect(() => {
    if (currentFriend && !post.seen && inViewport) {
      const timeout = setTimeout(() => {
        void fetchRoute<{ authorId: string }>(routes.posts.markSeen, {
          params: {
            id: post.id,
            query: {
              friend_token: currentFriend.access_token,
            },
          },
          descriptor: "mark post as seen",
          failSilently: true,
        }).then(({ authorId }) => {
          mutateUserPagePosts(authorId, currentFriend.access_token);
        });
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [inViewport]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div {...{ ref }}>{children}</div>;
};
