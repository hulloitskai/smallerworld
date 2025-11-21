import { useInViewport } from "@mantine/hooks";
import { type PropsWithChildren } from "react";

import { NEKO_SIZE } from "~/helpers/neko";
import { useWebPush } from "~/helpers/webPush";
import {
  mutateWorldPosts,
  useWorldPosts,
  type WorldPageProps,
} from "~/helpers/worlds";
import { type WorldFriendPost } from "~/types";

import EncouragementCard from "./EncouragementCard";
import FeedbackNeko from "./FeedbackNeko";
import FriendPostCardActions from "./FriendPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";
import PublicPostCardActions from "./PublicPostCardActions";
import WorldTimelineCard from "./WorldTimelineCard";

export interface WorldPageFeedProps extends BoxProps {}

const WorldPageFeed: FC<WorldPageFeedProps> = props => {
  const { currentFriend, world, replyToNumber, lastSentEncouragement } =
    usePageProps<WorldPageProps>();
  const queryParams = useQueryParams();
  const { pushRegistration } = useWebPush();

  const [date, setDate] = useState<string | null>(null);

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useWorldPosts(
    world.id,
    {
      date,
    },
  );
  const longerThan24HoursSinceLastPost = useMemo(() => {
    if (!posts || date) {
      return false;
    }
    const [lastPost] = posts;
    if (!lastPost) {
      return true;
    }
    const timestamp = DateTime.fromISO(lastPost.created_at);
    return DateTime.now().diff(timestamp, "hours").hours > 24;
  }, [posts, date]);

  const showEncouragementCard =
    !!currentFriend &&
    (!!lastSentEncouragement || longerThan24HoursSinceLastPost);
  return (
    <Stack {...props}>
      {showEncouragementCard && (
        <EncouragementCard
          {...{
            world,
            currentFriend,
            lastSentEncouragement,
          }}
          showNeko={!!pushRegistration}
          onEncouragementCreated={() => {
            router.reload({
              only: ["lastSentEncouragement"],
              async: true,
            });
          }}
        />
      )}
      <WorldTimelineCard
        worldId={world.id}
        friendAccessToken={currentFriend?.access_token}
        {...{ date }}
        onDateChange={setDate}
      />
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
            {posts.map((post, index) => {
              const children = (
                <Box pos="relative">
                  <PostCard
                    {...{ post }}
                    blurContent={!currentFriend && post.visibility !== "public"}
                    focus={queryParams.post_id === post.id}
                    actions={
                      post.user_post_type === "friend" && replyToNumber ? (
                        <FriendPostCardActions
                          {...{ world, post, replyToNumber }}
                        />
                      ) : (
                        <PublicPostCardActions postId={post.id} />
                      )
                    }
                  />
                  {!world.hide_neko &&
                    !showEncouragementCard &&
                    index === 0 && (
                      <FeedbackNeko
                        pos="absolute"
                        top={(post.encouragement ? 36 : 3) - NEKO_SIZE}
                        right="var(--mantine-spacing-lg)"
                      />
                    )}
                </Box>
              );
              return post.user_post_type === "friend" ? (
                <TrackUserPostSeen key={post.id} {...{ post }}>
                  {children}
                </TrackUserPostSeen>
              ) : (
                children
              );
            })}
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

export default WorldPageFeed;

interface TrackUserPostSeenProps extends PropsWithChildren {
  post: WorldFriendPost;
}

const TrackUserPostSeen: FC<TrackUserPostSeenProps> = ({ post, children }) => {
  const { currentFriend } = usePageProps<WorldPageProps>();
  const { ref, inViewport } = useInViewport<HTMLDivElement>();
  useEffect(() => {
    if (currentFriend && !post.seen && inViewport) {
      const timeout = setTimeout(() => {
        void fetchRoute<{ worldId: string }>(routes.posts.markSeen, {
          params: {
            id: post.id,
            query: {
              friend_token: currentFriend.access_token,
            },
          },
          descriptor: "mark post as seen",
          failSilently: true,
        }).then(({ worldId }) => {
          void mutateWorldPosts(worldId);
        });
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [inViewport]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div {...{ ref }}>{children}</div>;
};
