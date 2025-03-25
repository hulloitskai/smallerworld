import { Affix, Drawer, Modal } from "@mantine/core";

import { type PostView } from "~/types";

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
  const isStandalone = useIsStandalone();

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

  // == Affix
  const affixInset = "var(--mantine-spacing-xl)";

  const { breakpoints } = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.xs})`);
  const ModalOrDrawer = isMobile ? Drawer : Modal;
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Space className={classes.space} />
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
                className={classes.pinnedPostsButton}
                leftSection={
                  <Center className={classes.pinnedPostsButtonBadge}>
                    {pinnedPosts.length}
                  </Center>
                }
                {...{ style }}
                onClick={() => {
                  setOpened(true);
                }}
              >
                {possessive(user.name)} upcoming events
              </Button>
            )}
          </Transition>
        </Center>
      </Affix>
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

export default UserPageFloatingActions;
