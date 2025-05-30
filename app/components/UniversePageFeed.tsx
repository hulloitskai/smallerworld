import { Image } from "@mantine/core";

import { useUniversePosts } from "~/helpers/universe";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";

import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";
import PublicPostCardActions from "./PublicPostCardActions";

import classes from "./UniversePageFeed.module.css";

export interface UniversePageFeedProps extends BoxProps {}

const AUTHOR_ICON_SIZE = 26;

const UniversePageFeed: FC<UniversePageFeedProps> = props => {
  const params = useQueryParams();

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useUniversePosts();

  return (
    <Stack {...props}>
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
                <PostCard
                  {...{ post }}
                  focus={params.post_id === post.id}
                  actions={<PublicPostCardActions postId={post.id} />}
                />
                <Button
                  className={classes.authorButton}
                  component={Link}
                  href={routes.users.show.path({ handle: post.author.handle })}
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
