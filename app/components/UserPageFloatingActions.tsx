import { Affix } from "@mantine/core";

import { useUserPageDialogOpened } from "~/helpers/userPages";
import { type PostView } from "~/types";

import DrawerModal from "./DrawerModal";
import FriendPostCardActions, {
  type FriendPostCardActionsProps,
} from "./FriendPostCardActions";
import PostCard from "./PostCard";

import classes from "./UserPageFloatingActions.module.css";

export interface UserPageFloatingActionsProps
  extends Pick<FriendPostCardActionsProps, "user" | "replyPhoneNumber"> {}

const UserPageFloatingActions: FC<UserPageFloatingActionsProps> = ({
  user,
  replyPhoneNumber,
}) => {
  const currentFriend = useCurrentFriend();

  // == Load pinned posts
  const { data } = useRouteSWR<{ posts: PostView[] }>(routes.userPosts.pinned, {
    params: {
      user_id: user.id,
      ...(currentFriend && {
        query: {
          friend_token: currentFriend.access_token,
        },
      }),
    },
    descriptor: "load posts",
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
      <Affix className={classes.affix} position={{}}>
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
