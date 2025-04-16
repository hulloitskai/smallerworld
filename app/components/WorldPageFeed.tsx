import { Text } from "@mantine/core";

import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import { usePosts } from "~/helpers/posts";
import { type WorldPageProps } from "~/pages/WorldPage";

import AuthorPostCardActions from "./AuthorPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";

export interface WorldPageFeedProps extends BoxProps {}

const WorldPageFeed: FC<WorldPageFeedProps> = props => {
  const { currentUser } = usePageProps<WorldPageProps>();
  const { post_id } = useQueryParams();

  // == Load posts
  const { posts, setSize, hasMorePosts, isValidating } = usePosts();

  return (
    <Stack {...props}>
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
                focus={post_id === post.id}
                actions={
                  <AuthorPostCardActions user={currentUser} {...{ post }} />
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

export default WorldPageFeed;
