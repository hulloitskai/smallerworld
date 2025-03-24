import { Affix, Button } from "@mantine/core";

import { type Post } from "~/types";

import AuthorPostCardActions from "./AuthorPostCardActions";
import PostCard from "./PostCard";

import classes from "./UserPagePinnedPosts.module.css";

export interface UserPagePinnedPostsProps {
  userId: string;
}

const UserPagePinnedPosts: FC<UserPagePinnedPostsProps> = ({ userId }) => {
  const currentFriend = useCurrentFriend();
  const isStandalone = useIsStandalone();

  // == Load pinned posts
  const { data } = useRouteSWR<{ posts: Post[] }>(routes.userPosts.pinned, {
    params: currentFriend
      ? {
          user_id: userId,
          query: {
            friend_token: currentFriend.access_token,
          },
        }
      : null,
    descriptor: "load pinned posts",
  });
  const pinnedPosts = data?.posts ?? [];

  // == Affix
  const affixInset = "var(--mantine-spacing-xl)";
  return (
    <>
      <Space h={50} />
      <Affix
        position={{
          bottom: `max(${affixInset}, var(--safe-area-inset-bottom, 0px))`,
          left: affixInset,
          right: affixInset,
        }}
      >
        <Center style={{ pointerEvents: "none" }}>
          <Transition
            transition="pop"
            mounted={!!isStandalone && !isEmpty(pinnedPosts)}
          >
            {style => (
              <Button
                variant="filled"
                radius="xl"
                className={classes.button}
                leftSection={
                  <Center className={classes.buttonBadge}>
                    {pinnedPosts.length}
                  </Center>
                }
                {...{ style }}
                onClick={() => {
                  openModal({
                    title: "your upcoming invitations",
                    styles: {
                      header: {
                        minHeight: 0,
                      },
                    },
                    children: (
                      <Stack>
                        {pinnedPosts.map(post => (
                          <PostCard
                            key={post.id}
                            {...{ post }}
                            actions={<AuthorPostCardActions {...{ post }} />}
                          />
                        ))}
                      </Stack>
                    ),
                  });
                }}
              >
                your invitations
              </Button>
            )}
          </Transition>
        </Center>
      </Affix>
    </>
  );
};

export default UserPagePinnedPosts;
