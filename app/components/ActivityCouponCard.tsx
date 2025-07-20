import { AspectRatio, Popover, Text } from "@mantine/core";

import AtIcon from "~icons/heroicons/at-symbol-20-solid";

import {
  messageUri,
  MESSAGING_PLATFORM_TO_ICON,
  MESSAGING_PLATFORM_TO_LABEL,
  MESSAGING_PLATFORMS,
} from "~/helpers/messaging";
import { confetti } from "~/helpers/particles";
import { type ActivityCoupon, type Friend, type User } from "~/types";

import activityCardClasses from "./ActivityCard.module.css";
import classes from "./ActivityCouponCard.module.css";

export interface ActivityCouponCardProps extends BoxProps {
  currentFriend: Friend;
  replyToNumber: string;
  user: User;
  coupon: ActivityCoupon;
  onCouponRedeemed: () => void;
}

const ActivityCouponCard: FC<ActivityCouponCardProps> = ({
  currentFriend,
  replyToNumber,
  user,
  coupon,
  onCouponRedeemed,
  className,
  ...otherProps
}) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const { activity } = coupon;

  // == Mark coupon as redeemed
  const { trigger: triggerMarkAsRedeemed, mutating: markingAsRedeemed } =
    useRouteMutation(routes.activityCoupons.markAsRedeemed, {
      params: {
        id: coupon.id,
        query: {
          friend_token: currentFriend.access_token,
        },
      },
      descriptor: "mark coupon as redeemed",
      onSuccess: () => {
        toast.success("activity coupon marked as redeemed");
        void confetti({
          position: {
            x: 50,
            y: 50,
          },
          angle: 180,
          spread: 200,
          ticks: 60,
          gravity: 1,
          startVelocity: 18,
          count: 12,
          scalar: 2,
          shapes: ["emoji"],
          shapeOptions: {
            emoji: {
              value: coupon.activity.emoji ?? "🎟️",
            },
          },
        });
        void mutateRoute(routes.activityCoupons.index, {
          query: { friend_token: currentFriend.access_token },
        });
        onCouponRedeemed();
      },
    });

  return (
    <Stack
      className={cn("ActivityCouponCard", className)}
      align="center"
      gap="sm"
      {...otherProps}
    >
      <AspectRatio ratio={512 / 262} className={activityCardClasses.container}>
        <Box className={activityCardClasses.stub}>
          <Card className={activityCardClasses.card} withBorder>
            <Stack gap={0} justify="center" h="100%" ta="center">
              <Text
                className={activityCardClasses.activityName}
                size="lg"
                c="black"
              >
                {activity.name}
              </Text>
              <Text
                className={activityCardClasses.activityDescription}
                size="sm"
                lineClamp={3}
                ta="center"
              >
                {activity.description}
              </Text>
              <Space h="xs" style={{ flexShrink: 1 }} />
            </Stack>
            {!!activity.emoji && (
              <Badge
                variant="default"
                classNames={{
                  root: activityCardClasses.cardBadge,
                  label: activityCardClasses.emojiBadgeLabel,
                }}
                top={-12}
              >
                {[...new Array(3)].map(() => activity.emoji).join(" ")}
              </Badge>
            )}
            {!!activity.location_name && (
              <Badge
                variant="default"
                classNames={{
                  root: activityCardClasses.cardBadge,
                  label: activityCardClasses.locationBadgeLabel,
                }}
                leftSection={<AtIcon />}
                bottom={-12}
                pl={6}
              >
                {activity.location_name}
              </Badge>
            )}
          </Card>
        </Box>
      </AspectRatio>
      <Text size="xs" c="dimmed">
        expires <TimeAgo>{coupon.expires_at}</TimeAgo>
      </Text>
      <Popover shadow="md" portalProps={{ target: vaulPortalTarget }}>
        <Popover.Target>
          <Button
            size="compact-sm"
            variant="filled"
            leftSection={<CouponIcon />}
          >
            redeem coupon
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap={8}>
            <Text ta="center" ff="heading" fw={500} size="sm">
              contact {user.name} to redeem:
            </Text>
            <Group justify="center" gap="sm">
              {MESSAGING_PLATFORMS.map(platform => (
                <Stack key={platform} gap={2} align="center" miw={60}>
                  <ActionIcon
                    component="a"
                    href={messageUri(
                      replyToNumber,
                      `I'd like to do ${activity.name} with you :) when r u free for this?`,
                      platform,
                    )}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    variant="light"
                    size="lg"
                  >
                    <Box component={MESSAGING_PLATFORM_TO_ICON[platform]} />
                  </ActionIcon>
                  <Text size="xs" fw={500} ff="heading" c="dimmed">
                    {MESSAGING_PLATFORM_TO_LABEL[platform]}
                  </Text>
                </Stack>
              ))}
            </Group>
            <Anchor
              component="button"
              className={classes.markAsRedeemedButton}
              size="xs"
              disabled={markingAsRedeemed}
              onClick={() => {
                void triggerMarkAsRedeemed();
              }}
            >
              mark as redeemed
            </Anchor>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Stack>
  );
};

export default ActivityCouponCard;
