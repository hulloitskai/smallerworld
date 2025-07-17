import { type BoxProps, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import CalendarIcon from "~icons/heroicons/calendar-20-solid";

import { useUserPageDialogOpened } from "~/helpers/userPages";
import { type UserPageProps } from "~/pages/UserPage";
import { type ActivityCoupon, type UserPost } from "~/types";

import ActivityCouponsCarousel from "./ActivityCouponsCarousel";
import DrawerModal from "./DrawerModal";
import FriendPostCardActions from "./FriendPostCardActions";
import PostCard from "./PostCard";

import classes from "./UserPageInvitationsButton.module.css";

export interface UserPageInvitationsButtonProps extends BoxProps {}

const UserPageInvitationsButton: FC<UserPageInvitationsButtonProps> = ({
  style,
  ...otherProps
}) => {
  const { user, replyToNumber, allowFriendSharing } =
    usePageProps<UserPageProps>();
  const currentFriend = useCurrentFriend();

  // == Load pinned posts
  const { data: pinnedPostsData } = useRouteSWR<{ posts: UserPost[] }>(
    routes.userPosts.pinned,
    {
      params: {
        user_id: user.id,
        ...(currentFriend &&
          !!replyToNumber && {
            query: {
              friend_token: currentFriend.access_token,
            },
          }),
      },
      descriptor: "load posts",
    },
  );
  const pinnedPosts = pinnedPostsData?.posts ?? [];

  // == Load activity coupons
  const { modals } = useModals();
  const [showActivityCouponTooltip, setShowActivityCouponTooltip] =
    useState(false);
  useEffect(() => {
    const showTimeout = setTimeout(() => {
      setShowActivityCouponTooltip(true);
    }, 2000);
    const hideTimeout = setTimeout(() => {
      setShowActivityCouponTooltip(false);
    }, 4200);
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);
  const { data: activityCouponsData } = useRouteSWR<{
    activityCoupons: ActivityCoupon[];
  }>(routes.activityCoupons.index, {
    params: currentFriend
      ? {
          query: {
            friend_token: currentFriend.access_token,
          },
        }
      : null,
    descriptor: "load activity coupons",
  });
  const { activityCoupons = [] } = activityCouponsData ?? {};

  // == Drawer modal
  const [drawerModalOpened, setDrawerModalOpened] = useState(false);

  // == Page dialog state
  useUserPageDialogOpened(drawerModalOpened);

  const invitationCount = pinnedPosts.length + activityCoupons.length;
  return (
    <>
      <Transition
        transition="pop"
        mounted={
          !!pinnedPostsData &&
          !!activityCouponsData &&
          (!isEmpty(pinnedPosts) || !isEmpty(activityCoupons))
        }
      >
        {transitionStyle => (
          <Tooltip
            label={<>{user.name} sent you an activity coupon!</>}
            opened={
              !isEmpty(activityCoupons) &&
              isEmpty(modals) &&
              showActivityCouponTooltip
            }
          >
            <Button
              id="invitations"
              variant="filled"
              radius="xl"
              className={classes.button}
              leftSection={<CouponIcon />}
              onClick={() => {
                setDrawerModalOpened(true);
              }}
              style={[style, transitionStyle]}
              {...otherProps}
            >
              you have {invitationCount} invitations
            </Button>
          </Tooltip>
        )}
      </Transition>
      <DrawerModal
        title="invitations to stuff i'm doing"
        opened={drawerModalOpened}
        onClose={() => {
          setDrawerModalOpened(false);
        }}
      >
        <Stack gap="lg">
          {!isEmpty(activityCoupons) && !!replyToNumber && (
            <Box className={classes.activityCouponsContainer}>
              <Stack gap="md">
                <Box px="md">
                  <Group gap={8} justify="center">
                    <CouponIcon />
                    <Title order={3} size="h4">
                      activity coupons
                    </Title>
                  </Group>
                  <Text size="xs" c="dimmed" lh="xs" ta="center">
                    private invitations for us to do stuff together, that you
                    can redeem anytime.
                  </Text>
                </Box>
                <ActivityCouponsCarousel
                  {...{ replyToNumber, user }}
                  coupons={activityCoupons}
                />
              </Stack>
            </Box>
          )}
          {!isEmpty(pinnedPosts) && (
            <Stack gap="sm">
              <Box>
                <Group gap={8} justify="center">
                  <CalendarIcon />
                  <Title order={3} size="h4">
                    upcoming events
                  </Title>
                </Group>
                <Text size="xs" c="dimmed" lh="xs" ta="center">
                  gatherings that i&apos;m hosting or attending, that
                  you&apos;re welcome to join me on.
                </Text>
              </Box>
              {pinnedPosts.map(post => (
                <PostCard
                  key={post.id}
                  {...{ post }}
                  blurContent={!currentFriend && post.visibility !== "public"}
                  actions={
                    <FriendPostCardActions
                      {...{ user, post, replyToNumber }}
                      shareable={allowFriendSharing}
                    />
                  }
                />
              ))}
            </Stack>
          )}
        </Stack>
      </DrawerModal>
    </>
  );
};

export default UserPageInvitationsButton;
