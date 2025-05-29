import { Loader, Text } from "@mantine/core";

import HideIcon from "~icons/heroicons/chevron-up-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";
import ClearIcon from "~icons/heroicons/x-mark-20-solid";

import { usePosts } from "~/helpers/posts";
import { type WorldPageProps } from "~/pages/WorldPage";

import AuthorPostCardActions from "./AuthorPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";

export interface WorldPageFeedProps extends BoxProps {
  showSearch: boolean;
  onRequestHideSearch: () => void;
}

const WorldPageFeed: FC<WorldPageFeedProps> = ({
  showSearch,
  onRequestHideSearch,
  ...otherProps
}) => {
  const { currentUser, hideStats, pausedFriends } =
    usePageProps<WorldPageProps>();
  const params = useQueryParams();

  // == Load posts
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);
  const { posts, setSize, hasMorePosts, isValidating } = usePosts({
    searchQuery: debouncedSearchQuery,
  });

  return (
    <Stack {...otherProps}>
      <Transition transition="slide-down" mounted={showSearch}>
        {style => (
          <TextInput
            leftSection={<SearchIcon />}
            rightSection={
              isValidating ? (
                <Loader size="xs" />
              ) : (
                <Tooltip
                  label={searchQuery ? "clear search" : "hide search"}
                  openDelay={600}
                >
                  <ActionIcon
                    {...(searchQuery
                      ? {
                          color: "red",
                          onClick: () => {
                            setSearchQuery("");
                          },
                        }
                      : {
                          onClick: onRequestHideSearch,
                        })}
                    {...{ style }}
                  >
                    {searchQuery ? <ClearIcon /> : <HideIcon />}
                  </ActionIcon>
                </Tooltip>
              )
            }
            placeholder="search your posts"
            value={searchQuery}
            onChange={({ currentTarget }) =>
              setSearchQuery(currentTarget.value)
            }
            autoFocus
            {...{ style }}
          />
        )}
      </Transition>
      {posts ? (
        isEmpty(posts) ? (
          debouncedSearchQuery ? (
            <EmptyCard itemLabel="results" />
          ) : (
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
          )
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                {...{ post }}
                focus={params.post_id === post.id}
                actions={
                  <AuthorPostCardActions
                    user={currentUser}
                    {...{ post, hideStats, pausedFriends }}
                  />
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
