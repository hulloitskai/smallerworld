import { Loader, Text } from "@mantine/core";

import HideIcon from "~icons/heroicons/chevron-up-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";
import CloseIcon from "~icons/heroicons/x-mark";
import CloseOutlineIcon from "~icons/heroicons/x-mark-20-solid";

import {
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  useWorldPosts,
} from "~/helpers/posts";
import { type WorldPageProps } from "~/pages/WorldPage";
import { type PostType } from "~/types";

import AuthorPostCardActions from "./AuthorPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";

import classes from "./WorldPageFeed.module.css";

export interface WorldPageFeedProps extends BoxProps {
  showSearch: boolean;
  hideSearch: () => void;
}

const WorldPageFeed: FC<WorldPageFeedProps> = ({
  showSearch,
  hideSearch,
  ...otherProps
}) => {
  const { hideStats, pausedFriendIds, recentlyPausedFriendIds } =
    usePageProps<WorldPageProps>();
  const queryParams = useQueryParams();

  // == Input
  const inputRef = useRef<HTMLInputElement>(null);

  // == Load posts
  const [postType, setPostType] = useState<PostType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);
  const { posts, setSize, hasMorePosts, isValidating } = useWorldPosts({
    searchQuery: debouncedSearchQuery,
    type: postType,
  });

  return (
    <Stack {...otherProps}>
      <Transition transition="slide-down" mounted={showSearch}>
        {transitionStyle => (
          <TextInput
            ref={inputRef}
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
                            inputRef.current?.focus();
                          },
                        }
                      : {
                          onClick: hideSearch,
                        })}
                  >
                    {searchQuery ? <CloseIcon /> : <HideIcon />}
                  </ActionIcon>
                </Tooltip>
              )
            }
            placeholder="search your posts"
            autoFocus
            value={searchQuery}
            style={transitionStyle}
            onChange={({ currentTarget }) =>
              setSearchQuery(currentTarget.value)
            }
            onBlur={({ currentTarget }) => {
              if (currentTarget.value === "") {
                hideSearch();
              }
            }}
          />
        )}
      </Transition>
      {postType && (
        <Badge
          className={classes.typeBadge}
          variant="outline"
          leftSection={
            <Box component={POST_TYPE_TO_ICON[postType]} fz={10.5} />
          }
          rightSection={<CloseOutlineIcon />}
          onClick={() => {
            setPostType(null);
          }}
        >
          {POST_TYPE_TO_LABEL[postType]}
        </Badge>
      )}
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
                focus={queryParams.post_id === post.id}
                actions={
                  <AuthorPostCardActions
                    {...{
                      post,
                      hideStats,
                      pausedFriendIds,
                      recentlyPausedFriendIds,
                    }}
                  />
                }
                highlightType={post.type === postType}
                onTypeClick={() => {
                  setPostType(post.type === postType ? null : post.type);
                }}
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
