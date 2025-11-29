import { type ButtonProps, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import CalendarIcon from "~icons/heroicons/calendar-20-solid";

import { usePageDialogOpened } from "~/helpers/pageDialog";
import { useWebPush } from "~/helpers/webPush";
import { type WorldPageProps } from "~/helpers/worlds";
import { type ActivityCoupon, type WorldPost } from "~/types";

import ActivityCouponsCarousel from "./ActivityCouponsCarousel";
import DrawerModal from "./DrawerModal";
import PostCard from "./PostCard";
import PublicPostCardActions from "./PublicPostCardActions";
import WorldPostCardFriendActions from "./WorldPostCardFriendActions";

import classes from "./WorldPageInvitationsButton.module.css";

export interface WorldPageInvitationsButtonProps
  extends Omit<ButtonProps, "children"> {}

const WorldPageInvitationsButton: FC<WorldPageInvitationsButtonProps> = ({
  style,
  ...otherProps
}) => {
  const { world, replyToNumber, currentFriend } =
    usePageProps<WorldPageProps>();
  const { pushRegistration } = useWebPush();

  // == Load pinned posts
  const { data: pinnedPostsData } = useRouteSWR<{ posts: WorldPost[] }>(
    routes.worldPosts.pinned,
    {
      params: {
        world_id: world.id,
        ...(currentFriend && {
          query: {
            friend_token: currentFriend.access_token,
          },
        }),
      },
      descriptor: "load posts",
      keepPreviousData: true,
    },
  );
  const pinnedPosts = pinnedPostsData?.posts ?? [];

  // == Load activity coupons
  const { modals } = useModals();
  const [showActivityCouponTooltip, setShowActivityCouponTooltip] =
    useState(false);
  const tooltipActivatedRef = useRef(false);
  useEffect(() => {
    if (!pushRegistration || tooltipActivatedRef.current) {
      return;
    }
    tooltipActivatedRef.current = true;
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
  }, [pushRegistration]);
  const { data: activityCouponsData } = useRouteSWR<{
    activityCoupons: ActivityCoupon[];
  }>(routes.worldActivityCoupons.index, {
    params:
      currentFriend && !!replyToNumber
        ? {
            world_id: world.id,
            query: {
              friend_token: currentFriend.access_token,
            },
          }
        : null,
    descriptor: "load activity coupons",
    keepPreviousData: true,
  });
  const { activityCoupons = [] } = activityCouponsData ?? {};

  // == Drawer modal
  const [drawerModalOpened, setDrawerModalOpened] = useState(false);
  // Auto-open if url is targetting #invitations
  useEffect(() => {
    if (location.hash === "#invitations") {
      setDrawerModalOpened(true);
    }
  }, []);

  // == Page dialog
  usePageDialogOpened(drawerModalOpened);

  const invitationCount = pinnedPosts.length + activityCoupons.length;
  return (
    <>
      <Transition transition="pop" mounted={invitationCount > 0}>
        {transitionStyle => (
          <Tooltip
            label={<>{world.owner_name} sent you an activity coupon!</>}
            opened={
              !!pushRegistration &&
              !isEmpty(activityCoupons) &&
              isEmpty(modals) &&
              !drawerModalOpened &&
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
              you have {invitationCount}{" "}
              {inflect("invitation", invitationCount)}
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
          {!isEmpty(activityCoupons) && !!currentFriend && !!replyToNumber && (
            <Box className={classes.activityCouponsContainer}>
              <Stack gap="md">
                <Box px="md">
                  <Group gap={8}>
                    <CouponIcon />
                    <Title order={3} size="h4">
                      activity coupons
                    </Title>
                  </Group>
                  <Text size="xs" c="dimmed" lh="xs">
                    private invitations for us to do stuff together, that you
                    can redeem anytime.
                  </Text>
                </Box>
                <ActivityCouponsCarousel
                  {...{
                    currentFriend,
                    replyToNumber,
                    world,
                    activityCoupons,
                  }}
                />
              </Stack>
            </Box>
          )}
          {!isEmpty(pinnedPosts) && (
            <Stack gap="sm">
              <Box>
                <Group gap={8}>
                  <CalendarIcon />
                  <Title order={3} size="h4">
                    upcoming events
                  </Title>
                </Group>
                <Text size="xs" c="dimmed" lh="xs">
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
                    replyToNumber ? (
                      <WorldPostCardFriendActions
                        {...{ world, post, replyToNumber }}
                      />
                    ) : (
                      <PublicPostCardActions {...{ post }} />
                    )
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

export default WorldPageInvitationsButton;
