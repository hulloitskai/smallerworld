import { Image } from "@mantine/core";

import { useLocalUniversePosts } from "~/helpers/localUniverse";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { type LocalUniversePageProps } from "~/pages/LocalUniversePage";

import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";
import PublicPostCardActions from "./PublicPostCardActions";

import classes from "./LocalUniversePageFeed.module.css";

export interface LocalUniversePageFeedProps extends BoxProps {}

const AUTHOR_ICON_SIZE = 26;

const LocalUniversePageFeed: FC<LocalUniversePageFeedProps> = ({
  className,
  ...otherProps
}) => {
  const { currentUser } = usePageProps<LocalUniversePageProps>();
  const queryParams = useQueryParams();

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } =
    useLocalUniversePosts();

  return (
    <Stack className={cn("LocalUniversePageFeed", className)} {...otherProps}>
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
                  href={withTrailingSlash(
                    post.author.id === currentUser.id
                      ? routes.world.show.path()
                      : routes.users.show.path({
                          id: post.author.handle,
                          query: {
                            ...(post.associated_friend_access_token && {
                              friend_token: post.associated_friend_access_token,
                            }),
                          },
                        }),
                  )}
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
                  actions={<PublicPostCardActions postId={post.id} />}
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

export default LocalUniversePageFeed;
