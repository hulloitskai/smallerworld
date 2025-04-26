import { type BoxProps } from "@mantine/core";

import { useUserPageDialogOpened } from "~/helpers/userPages";
import { type UserPageProps } from "~/pages/UserPage";
import { type UserPost } from "~/types";

import DrawerModal from "./DrawerModal";
import FriendPostCardActions from "./FriendPostCardActions";
import PostCard from "./PostCard";

import classes from "./UserPageUpcomingEventsButton.module.css";

export interface UserPageUpcomingEventsButtonProps extends BoxProps {}

const UserPageUpcomingEventsButton: FC<UserPageUpcomingEventsButtonProps> = ({
  style,
  ...otherProps
}) => {
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
  });
  const pinnedPosts = data?.posts ?? [];

  // == Drawer modal
  const [drawerModalOpened, setDrawerModalOpened] = useState(false);

  // == Page dialog state
  useUserPageDialogOpened(drawerModalOpened);

  return (
    <>
      <Transition transition="pop" mounted={!isEmpty(pinnedPosts)}>
        {transitionStyle => (
          <Button
            variant="filled"
            radius="xl"
            className={classes.button}
            leftSection={
              <Center className={classes.badge}>{pinnedPosts.length}</Center>
            }
            onClick={() => {
              setDrawerModalOpened(true);
            }}
            style={[style, transitionStyle]}
            {...otherProps}
          >
            upcoming events
          </Button>
        )}
      </Transition>
      <DrawerModal
        title="invitations to stuff i'm doing"
        opened={drawerModalOpened}
        onClose={() => {
          setDrawerModalOpened(false);
        }}
      >
        <Stack>
          {pinnedPosts.map(post => (
            <PostCard
              key={post.id}
              {...{ post }}
              blurContent={!currentFriend && post.visibility !== "public"}
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

export default UserPageUpcomingEventsButton;
