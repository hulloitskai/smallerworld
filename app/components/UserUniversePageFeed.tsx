import { Image } from "@mantine/core";

import { useUserUniversePosts } from "~/helpers/userUniverse";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { type World } from "~/types";

import AuthorPostCardActions from "./AuthorPostCardActions";
import FriendPostCardActions from "./FriendPostCardActions";
import LoadMoreButton from "./LoadMoreButton";
import PostCard from "./PostCard";
import PublicPostCardActions from "./PublicPostCardActions";

import classes from "./UserUniversePageFeed.module.css";

export interface UserUniversePageFeedProps extends BoxProps {
  userWorld: World | null;
}

const WORLD_ICON_SIZE = 26;

const UserUniversePageFeed: FC<UserUniversePageFeedProps> = ({
  className,
  userWorld,
  ...otherProps
}) => {
  const queryParams = useQueryParams();

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useUserUniversePosts();

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
                {!!post.world && (
                  <Button
                    className={classes.worldButton}
                    component={PWAScopedLink}
                    href={
                      post.world.id === userWorld?.id
                        ? withTrailingSlash(routes.userWorld.show.path())
                        : withTrailingSlash(
                            routes.worlds.show.path({
                              id: post.world_id,
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
                        className={classes.worldImage}
                        src={post.world.icon.src}
                        {...(post.world.icon.srcset && {
                          srcSet: post.world.icon.srcset,
                        })}
                        w={WORLD_ICON_SIZE}
                        h={WORLD_ICON_SIZE}
                        radius={WORLD_ICON_SIZE / WORLD_ICON_RADIUS_RATIO}
                      />
                    }
                  >
                    {post.world.name}
                  </Button>
                )}
                <PostCard
                  {...{ post }}
                  focus={queryParams.post_id === post.id}
                  actions={
                    userWorld && post.universe_post_type === "author" ? (
                      <AuthorPostCardActions world={userWorld} {...{ post }} />
                    ) : post.world && post.universe_post_type === "friend" ? (
                      <FriendPostCardActions
                        {...{ post }}
                        world={post.world}
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

export default UserUniversePageFeed;
