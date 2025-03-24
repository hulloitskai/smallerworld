import { Affix, Button } from "@mantine/core";

import { type PostView } from "~/types";

import FriendPostCardActions, {
  type FriendPostCardActionsProps,
} from "./FriendPostCardActions";
import PostCard from "./PostCard";

import classes from "./UserPagePinnedPosts.module.css";

export interface UserPagePinnedPostsProps
  extends Pick<FriendPostCardActionsProps, "user" | "replyPhoneNumber"> {}

const UserPagePinnedPosts: FC<UserPagePinnedPostsProps> = ({
  user,
  replyPhoneNumber,
}) => {
  const currentFriend = useCurrentFriend();
  const isStandalone = useIsStandalone();

  // == Load pinned posts
  const { data } = useRouteSWR<{ posts: PostView[] }>(routes.userPosts.pinned, {
    params: currentFriend
      ? {
          user_id: user.id,
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
                            actions={
                              <FriendPostCardActions
                                {...{ user, post, replyPhoneNumber }}
                              />
                            }
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
