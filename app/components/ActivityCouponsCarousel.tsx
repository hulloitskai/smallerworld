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
      "currentFriend" | "replyToNumber" | "user"
    >,
    BoxProps {
  coupons: ActivityCoupon[];
}

const ActivityCouponsCarousel: FC<ActivityCouponsCarouselProps> = ({
  currentFriend,
  replyToNumber,
  user,
  coupons,
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
      {coupons.map(coupon => (
        <Carousel.Slide key={coupon.id}>
          <ActivityCouponCard
            {...{ currentFriend, replyToNumber, user, coupon }}
            onCouponRedeemed={() => {}}
          />
        </Carousel.Slide>
      ))}
    </Carousel>
  );
};

export default ActivityCouponsCarousel;
