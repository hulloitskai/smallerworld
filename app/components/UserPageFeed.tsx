import { useInViewport } from "@mantine/hooks";
import { type PropsWithChildren } from "react";

import { NEKO_SIZE } from "~/helpers/neko";
import { mutateUserPagePosts, useUserPagePosts } from "~/helpers/userPages";
import { useWebPush } from "~/helpers/webPush";
import { type UserPageProps } from "~/pages/UserPage";
import { type UserPost } from "~/types";

import ActivityCouponsCarousel from "./ActivityCouponsCarousel";
import EncouragementCard from "./EncouragementCard";
import FriendPostCardActions from "./FriendPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";
import SleepyNeko from "./SleepyNeko";

import classes from "./UserPageFeed.module.css";

export interface UserPageFeedProps extends BoxProps {}

const UserPageFeed: FC<UserPageFeedProps> = props => {
  const {
    currentFriend,
    user,
    replyToNumber,
    lastSentEncouragement,
    hideNeko,
    allowFriendSharing,
    activityCoupons,
  } = usePageProps<UserPageProps>();
  const params = useQueryParams();
  const { registration: pushRegistration } = useWebPush();

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useUserPagePosts(
    user.id,
  );
  const longerThan24HoursSinceLastPost = useMemo(() => {
    if (!posts) {
      return false;
    }
    const [lastPost] = posts;
    if (!lastPost) {
      return true;
    }
    const timestamp = DateTime.fromISO(lastPost.created_at);
    return DateTime.now().diff(timestamp, "hours").hours > 24;
  }, [posts]);

  const showEncouragementCard =
    !!currentFriend &&
    user.supported_features.includes("encouragements") &&
    (!!lastSentEncouragement || longerThan24HoursSinceLastPost);
  return (
    <Stack {...props}>
      {!!replyToNumber && !isEmpty(activityCoupons) && (
        <ActivityCouponsCarousel
          {...{ replyToNumber }}
          className={classes.activityCouponsCarousel}
          coupons={activityCoupons}
        />
      )}
      {showEncouragementCard && (
        <EncouragementCard
          {...{
            currentFriend,
            user,
            lastSentEncouragement,
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
            {posts.map((post, index) => (
              <TrackUserPostSeen key={post.id} {...{ post }}>
                <Box pos="relative">
                  <PostCard
                    {...{ post }}
                    blurContent={!currentFriend && post.visibility !== "public"}
                    focus={params.post_id === post.id}
                    actions={
                      <FriendPostCardActions
                        {...{ user, post, replyToNumber }}
                        shareable={allowFriendSharing}
                      />
                    }
                  />
                  {!hideNeko &&
                    !!pushRegistration &&
                    !showEncouragementCard &&
                    index === 0 && (
                      <SleepyNeko
                        pos="absolute"
                        top={3 - NEKO_SIZE}
                        right="var(--mantine-spacing-lg)"
                      />
                    )}
                </Box>
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
