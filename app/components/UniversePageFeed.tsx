import { Image } from "@mantine/core";

import { useUniversePosts } from "~/helpers/universe";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/users";
import { type UniversePageProps } from "~/pages/UniversePage";

import AuthorPostCardActions from "./AuthorPostCardActions";
import FriendPostCardActions from "./FriendPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";
import PublicPostCardActions from "./PublicPostCardActions";

import classes from "./UniversePageFeed.module.css";

export interface UniversePageFeedProps extends BoxProps {}

const AUTHOR_ICON_SIZE = 26;

const UniversePageFeed: FC<UniversePageFeedProps> = ({
  className,
  ...otherProps
}) => {
  const { currentUser, hideStats } = usePageProps<UniversePageProps>();
  const queryParams = useQueryParams();

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useUniversePosts();

  return (
    <Stack className={cn("UniversePageFeed", className)} {...otherProps}>
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
              <Stack key={post.id} gap={6}>
                <Button
                  className={classes.authorButton}
                  component={PWAScopedLink}
                  href={
                    post.author.id === currentUser.id
                      ? withTrailingSlash(routes.world.show.path())
                      : withTrailingSlash(
                          routes.users.show.path({
                            id: post.author.handle,
                            query: {
                              ...(post.universe_post_type === "friend" && {
                                friend_token:
                                  post.associated_friend.access_token,
                              }),
                            },
                          }),
                        )
                  }
                  size="sm"
                  variant="subtle"
                  leftSection={
                    <Image
                      className={classes.authorImage}
                      src={post.author.page_icon.src}
                      {...(post.author.page_icon.srcset && {
                        srcSet: post.author.page_icon.srcset,
                      })}
                      w={AUTHOR_ICON_SIZE}
                      h={AUTHOR_ICON_SIZE}
                      radius={AUTHOR_ICON_SIZE / USER_ICON_RADIUS_RATIO}
                    />
                  }
                >
                  {possessive(post.author.name)} world
                </Button>
                <PostCard
                  {...{ post }}
                  focus={queryParams.post_id === post.id}
                  actions={
                    post.universe_post_type === "author" ? (
                      <AuthorPostCardActions
                        {...{
                          post,
                          hideStats,
                        }}
                      />
                    ) : post.universe_post_type === "friend" ? (
                      <FriendPostCardActions
                        {...{ post }}
                        author={post.author}
                        replyToNumber={post.reply_to_number}
                        asFriend={post.associated_friend}
                      />
                    ) : (
                      <PublicPostCardActions postId={post.id} />
                    )
                  }
                />
              </Stack>
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

export default UniversePageFeed;
