import { Affix } from "@mantine/core";

import { useUserPageDialogOpened } from "~/helpers/userPages";
import { type UserPageProps } from "~/pages/UserPage";
import { type UserPost } from "~/types";

import DrawerModal from "./DrawerModal";
import FriendPostCardActions from "./FriendPostCardActions";
import PostCard from "./PostCard";

import classes from "./UserPageFloatingActions.module.css";

export interface UserPageFloatingActionsProps {}

const UserPageFloatingActions: FC<UserPageFloatingActionsProps> = () => {
  const { user, replyPhoneNumber } = usePageProps<UserPageProps>();
  const currentFriend = useCurrentFriend();

  // == Load pinned posts
  const { data } = useRouteSWR<{ posts: UserPost[] }>(routes.userPosts.pinned, {
    params: {
      user_id: user.id,
      ...(currentFriend && {
        query: {
          friend_token: currentFriend.access_token,
        },
      }),
    },
    descriptor: "load posts",
    keepPreviousData: true,
  });
  const pinnedPosts = data?.posts ?? [];

  // == Pinned posts drawer modal
  const [pinnedPostsDrawerModalOpened, setPinnedPostsDrawerModalOpened] =
    useState(false);

  // == Page dialog state
  const pageDialogOpened = useUserPageDialogOpened(
    pinnedPostsDrawerModalOpened,
  );

  return (
    <>
      <Space className={classes.space} />
      <Affix className={classes.affix} position={{}} zIndex={180}>
        <Center style={{ pointerEvents: "none" }}>
          <Transition
            transition="pop"
            mounted={!pageDialogOpened && !isEmpty(pinnedPosts)}
          >
            {style => (
              <Button
                variant="filled"
                size="md"
                radius="xl"
                className={classes.pinnedPostsButton}
                leftSection={
                  <Center className={classes.pinnedPostsButtonBadge}>
                    {pinnedPosts.length}
                  </Center>
                }
                {...{ style }}
                onClick={() => {
                  setPinnedPostsDrawerModalOpened(true);
                }}
              >
                {possessive(user.name)} upcoming events
              </Button>
            )}
          </Transition>
        </Center>
      </Affix>
      <DrawerModal
        title="invitations to stuff i'm doing"
        opened={pinnedPostsDrawerModalOpened}
        onClose={() => {
          setPinnedPostsDrawerModalOpened(false);
        }}
      >
        <Stack>
          {pinnedPosts.map(post => (
            <PostCard
              key={post.id}
              {...{ post }}
              actions={
                <FriendPostCardActions {...{ user, post, replyPhoneNumber }} />
              }
            />
          ))}
        </Stack>
      </DrawerModal>
    </>
  );
};

export default UserPageFloatingActions;
