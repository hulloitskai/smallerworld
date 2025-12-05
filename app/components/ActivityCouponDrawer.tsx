import { Carousel } from "@mantine/carousel";
import { AspectRatio, Text } from "@mantine/core";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { map } from "lodash-es";

import { prettyFriendName } from "~/helpers/friends";
import { useUserWorldActivities } from "~/helpers/userWorld";
import { type ActivityCoupon, type UserWorldFriendProfile } from "~/types";

import ActivityCard from "./ActivityCard";
import Drawer, { type DrawerProps } from "./Drawer";

import classes from "./ActivityCouponDrawer.module.css";
import "@mantine/carousel/styles.layer.css";

const ACTIVITY_CARD_WIDTH = 320;

export interface ActivityCouponDrawerProps
  extends Omit<DrawerProps, "children"> {
  friend: UserWorldFriendProfile;
}

const ActivityCouponDrawer: FC<ActivityCouponDrawerProps> = ({
  friend,
  opened,
  onClose,
  ...otherProps
}) => {
  const [wheelGesturesPlugin] = useState(WheelGesturesPlugin);

  // == Load activities
  const addedActivityIds = useMemo(
    () => map(friend.active_activity_coupons, "activity_id"),
    [friend.active_activity_coupons],
  );
  const {
    data: activitiesData,
    activities,
    activitiesAndTemplates,
  } = useUserWorldActivities({
    keepPreviousData: true,
  });
  const initialSlide = useMemo(() => {
    if (!activities) {
      return 0;
    }
    for (const [i, activity] of activities.entries()) {
      if (addedActivityIds.includes(activity.id)) {
        continue;
      }
      return i;
    }
    return 0;
  }, [activities, addedActivityIds]);

  // == Create coupon
  const { trigger, mutating } = useRouteMutation<{
    coupon: ActivityCoupon;
  }>(routes.activityCoupons.create, {
    descriptor: "create activity coupon",
    serializeData: attributes => ({ activity_coupon: attributes }),
    onSuccess: ({ coupon: { activity } }) => {
      onClose?.();
      toast.success(`you gave ${prettyFriendName(friend)} a coupon!`, {
        ...(!!activity.emoji && { icon: activity.emoji }),
      });
      void mutateRoute(routes.userWorldFriends.index);
    },
  });

  return (
    <Drawer
      title={
        <>
          send an activity coupon{" "}
          <Text size="xs" c="dimmed">
            give your friend a coupon they can redeem to do stuff with you!
          </Text>
        </>
      }
      {...{ opened, onClose }}
      {...otherProps}
    >
      <Carousel
        className={classes.carousel}
        {...{ initialSlide }}
        slideSize={ACTIVITY_CARD_WIDTH}
        slideGap="md"
        plugins={[wheelGesturesPlugin]}
        emblaOptions={{ align: "center" }}
      >
        {activitiesAndTemplates.map(activityOrTemplate => (
          <Carousel.Slide key={activityOrTemplate.id}>
            <ActivityCard
              {...{ activityOrTemplate }}
              addLabel="send coupon"
              addedLabel="already sent"
              disableAdded
              added={addedActivityIds.includes(activityOrTemplate.id)}
              loading={mutating}
              onChange={activity => {
                if (activity) {
                  void trigger({
                    activity_id: activity.id,
                    friend_id: friend.id,
                  });
                }
              }}
            />
          </Carousel.Slide>
        ))}
        {!activitiesData &&
          [...Array(3)].map((_, i) => (
            <Carousel.Slide key={i}>
              <AspectRatio ratio={512 / 262}>
                <Skeleton width={ACTIVITY_CARD_WIDTH} />
              </AspectRatio>
            </Carousel.Slide>
          ))}
      </Carousel>
    </Drawer>
  );
};

export default ActivityCouponDrawer;
