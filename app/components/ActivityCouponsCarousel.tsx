import { Carousel } from "@mantine/carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

import { type ActivityCoupon } from "~/types";

import ActivityCouponCard, {
  type ActivityCouponCardProps,
} from "./ActivityCouponCard";

import classes from "./ActivityCouponsCarousel.module.css";
import "@mantine/carousel/styles.layer.css";

const COUPON_CARD_WIDTH = 320;

export interface ActivityCouponsCarouselProps
  extends Pick<
      ActivityCouponCardProps,
      "currentFriend" | "replyToNumber" | "world"
    >,
    BoxProps {
  activityCoupons: ActivityCoupon[];
}

const ActivityCouponsCarousel: FC<ActivityCouponsCarouselProps> = ({
  currentFriend,
  replyToNumber,
  world,
  activityCoupons,
  className,
  ...otherProps
}) => {
  const [wheelGesturesPlugin] = useState(WheelGesturesPlugin);
  return (
    <Carousel
      className={cn("ActivityCouponsCarousel", classes.carousel, className)}
      slideSize={COUPON_CARD_WIDTH}
      slideGap="md"
      plugins={[wheelGesturesPlugin]}
      emblaOptions={{ align: "center" }}
      {...otherProps}
    >
      {activityCoupons.map(activityCoupon => (
        <Carousel.Slide key={activityCoupon.id}>
          <ActivityCouponCard
            {...{
              currentFriend,
              activityCoupon,
              world,
              replyToNumber,
            }}
            onActivityCouponRedeemed={() => {}}
          />
        </Carousel.Slide>
      ))}
    </Carousel>
  );
};

export default ActivityCouponsCarousel;
