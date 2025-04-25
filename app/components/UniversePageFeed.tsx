import { useUniversePosts } from "~/helpers/universe";

import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";
import PublicPostCardActions from "./PublicPostCardActions";

export interface UniversePageFeedProps extends BoxProps {}

const UniversePageFeed: FC<UniversePageFeedProps> = props => {
  const { post_id } = useQueryParams();

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
              <PostCard
                key={post.id}
                {...{ post }}
                focus={post_id === post.id}
                actions={<PublicPostCardActions postId={post.id} />}
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

export default UniversePageFeed;
