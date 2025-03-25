import { type BoxProps, Drawer, Modal } from "@mantine/core";

import { type PostView } from "~/types";

import FriendPostCardActions, {
  type FriendPostCardActionsProps,
} from "./FriendPostCardActions";
import PostCard from "./PostCard";

import classes from "./UserPageUpcomingEventsButton.module.css";

export interface UserPageUpcomingEventsButtonProps
  extends BoxProps,
    Pick<FriendPostCardActionsProps, "user" | "replyPhoneNumber"> {}

const UserPageUpcomingEventsButton: FC<UserPageUpcomingEventsButtonProps> = ({
  user,
  replyPhoneNumber,
  ...otherProps
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

  const { breakpoints } = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.xs})`);
  const ModalOrDrawer = isMobile ? Drawer : Modal;
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Transition transition="pop" mounted={!isEmpty(pinnedPosts)}>
        {style => (
          <Button
            variant="filled"
            radius="xl"
            className={classes.button}
            leftSection={
              <Center className={classes.badge}>{pinnedPosts.length}</Center>
            }
            onClick={() => {
              setOpened(true);
            }}
            {...{ style }}
            {...otherProps}
          >
            upcoming events
          </Button>
        )}
      </Transition>
      <ModalOrDrawer
        title="invitations to stuff i'm doing"
        {...(isMobile
          ? {
              size: "lg",
              styles: {
                content: {
                  paddingBottom: "var(--safe-area-inset-bottom, 0px)",
                },
              },
            }
          : {
              size: "var(--container-size-xs)",
            })}
        {...{ opened }}
        onClose={() => {
          setOpened(false);
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
      </ModalOrDrawer>
    </>
  );
};

export default UserPageUpcomingEventsButton;
