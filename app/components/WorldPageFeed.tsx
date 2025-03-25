import { Text } from "@mantine/core";

import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import { usePosts } from "~/helpers/posts";

import AuthorPostCardActions from "./AuthorPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";

export interface WorldPageFeedProps extends BoxProps {}

const WorldPageFeed: FC<WorldPageFeedProps> = () => {
  const { posts, setSize, hasMorePosts } = usePosts();
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
              <Text size="sm">
                create a new post with the{" "}
                <Badge
                  variant="filled"
                  mx={4}
                  px={4}
                  styles={{
                    root: {
                      verticalAlign: "middle",
                    },
                    label: { display: "flex", alignItems: "center" },
                  }}
                >
                  <NewIcon />
                </Badge>{" "}
                button :)
              </Text>
            </Stack>
          </Card>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                {...{ post }}
                actions={<AuthorPostCardActions {...{ post }} />}
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

export default WorldPageFeed;
