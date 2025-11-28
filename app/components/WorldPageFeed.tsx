import { NEKO_SIZE } from "~/helpers/neko";
import { useWebPush } from "~/helpers/webPush";
import { useWorldPosts, type WorldPageProps } from "~/helpers/worlds";

import FeedbackNeko from "./FeedbackNeko";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";
import PublicPostCardActions from "./PublicPostCardActions";
import WorldFriendEncouragementCard from "./WorldFriendEncouragementCard";
import WorldPostCardFriendActions from "./WorldPostCardFriendActions";
import WorldTimelineCard from "./WorldTimelineCard";

export interface WorldPageFeedProps extends BoxProps {}

const WorldPageFeed: FC<WorldPageFeedProps> = props => {
  const { currentFriend, world, replyToNumber, lastSentEncouragement } =
    usePageProps<WorldPageProps>();
  const queryParams = useQueryParams();
  const { pushRegistration } = useWebPush();

  // == Date
  const [date, setDate] = useState<string | null>(null);

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useWorldPosts(
    world.id,
    { date },
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
        <WorldFriendEncouragementCard
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
          <EmptyCard itemLabel="posts" />
        ) : (
          <>
            {posts.map((post, index) => {
              return (
                <Box pos="relative">
                  <PostCard
                    {...{ post }}
                    blurContent={!currentFriend && post.visibility !== "public"}
                    focus={queryParams.post_id === post.id}
                    actions={
                      replyToNumber ? (
                        <WorldPostCardFriendActions
                          {...{ world, post, replyToNumber }}
                        />
                      ) : (
                        <PublicPostCardActions {...{ post }} />
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
