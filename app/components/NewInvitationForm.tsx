import { Carousel } from "@mantine/carousel";
import { Text } from "@mantine/core";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { map } from "lodash-es";

import QRCodeIcon from "~icons/heroicons/qr-code-20-solid";

import { useUserWorldActivities } from "~/helpers/userWorld";
import { type Activity, type Invitation, type JoinRequest } from "~/types";

import ActivityCard from "./ActivityCard";
import EmojiPopover from "./EmojiPopover";

import classes from "./NewInvitationForm.module.css";
import "@mantine/carousel/styles.layer.css";

const ACTIVITY_CARD_WIDTH = 320;

export interface NewInvitationFormProps extends BoxProps {
  fromJoinRequest?: JoinRequest;
  onInvitationCreated?: (invitation: Invitation) => void;
}

const NewInvitationForm: FC<NewInvitationFormProps> = ({
  fromJoinRequest,
  onInvitationCreated,
  className,
  ...otherProps
}) => {
  const [wheelGesturesPlugin] = useState(WheelGesturesPlugin);

  // == Load activities
  const [showActivities, setShowActivities] = useState(false);
  const { activitiesAndTemplates } = useUserWorldActivities({
    keepPreviousData: true,
  });

  // == Form
  const initialValues = useMemo(
    () => ({
      invitee_emoji: "",
      invitee_name: fromJoinRequest?.name ?? "",
      offered_activities: [] as Activity[],
    }),
    [fromJoinRequest],
  );
  const {
    getInputProps,
    submit,
    submitting,
    values,
    setFieldValue,
    isDirty,
    initialize,
  } = useForm({
    action: routes.userWorldInvitations.create,
    descriptor: "create invitation",
    initialValues,
    transformValues: ({ invitee_emoji, invitee_name, offered_activities }) => ({
      invitation: {
        join_request_id: fromJoinRequest?.id ?? null,
        invitee_emoji: invitee_emoji || null,
        invitee_name: invitee_name.trim(),
        offered_activity_ids: map(offered_activities, "id"),
      },
    }),
    onSuccess: ({ invitation }: { invitation: Invitation }, { resetDirty }) => {
      resetDirty();
      setShowActivities(false);
      void mutateRoute(routes.userWorldInvitations.index);
      void mutateRoute(routes.userWorldJoinRequests.index);
      onInvitationCreated?.(invitation);
    },
  });
  useDidUpdate(() => {
    initialize(initialValues);
  }, [initialValues, initialize]);

  return (
    <Box
      component="form"
      onSubmit={submit}
      className={cn("NewInvitationForm", className)}
      {...otherProps}
    >
      <Stack gap="xs">
        <Group gap="xs" align="start">
          <EmojiPopover
            onEmojiClick={({ emoji }) => {
              setFieldValue("invitee_emoji", emoji);
            }}
          >
            {({ open, opened }) => (
              <ActionIcon
                className={classes.emojiButton}
                variant="default"
                size={36}
                onClick={() => {
                  if (values.invitee_emoji) {
                    setFieldValue("invitee_emoji", "");
                  } else {
                    open();
                  }
                }}
                mod={{ opened }}
              >
                {values.invitee_emoji ? (
                  <Box className={classes.emoji}>{values.invitee_emoji}</Box>
                ) : (
                  <Box component={EmojiIcon} c="dimmed" />
                )}
              </ActionIcon>
            )}
          </EmojiPopover>
          <Stack gap="xs" style={{ flexGrow: 1 }}>
            <TextInput
              {...getInputProps("invitee_name")}
              placeholder="friend's name"
            />
            <Transition
              transition="pop"
              mounted={!isEmpty(values.offered_activities)}
            >
              {transitionStyle => (
                <Group gap={8} wrap="wrap" style={transitionStyle}>
                  {values.offered_activities.map(activity => (
                    <Badge
                      className={classes.activityBadge}
                      key={activity.id}
                      variant="default"
                      leftSection={activity.emoji ?? <CouponIcon />}
                      rightSection={
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          color="red"
                          onClick={() => {
                            setFieldValue(
                              "offered_activities",
                              values.offered_activities.filter(
                                a => a.id !== activity.id,
                              ),
                            );
                          }}
                        >
                          <RemoveIcon />
                        </ActionIcon>
                      }
                    >
                      {activity.name}
                    </Badge>
                  ))}
                </Group>
              )}
            </Transition>
          </Stack>
        </Group>
        <Transition
          transition="pop"
          mounted={!isEmpty(activitiesAndTemplates) && !showActivities}
        >
          {transitionStyle => (
            <Button
              size="compact-sm"
              leftSection={<CouponIcon />}
              style={[transitionStyle, { alignSelf: "center" }]}
              onClick={() => {
                setShowActivities(show => !show);
              }}
            >
              include a coupon!
            </Button>
          )}
        </Transition>
        {!isEmpty(activitiesAndTemplates) && (
          <Transition
            transition="pop"
            mounted={showActivities}
            enterDelay={250}
          >
            {transitionStyle => (
              <Stack
                className={classes.activitiesContainer}
                gap="sm"
                style={transitionStyle}
              >
                <Box ta="center">
                  <Title order={3} size="h4">
                    activity coupons
                  </Title>
                  <Text size="xs" c="dimmed">
                    give your friend a coupon they can redeem to do stuff with
                    you!
                  </Text>
                </Box>
                <Carousel
                  className={classes.activitiesCarousel}
                  slideSize={ACTIVITY_CARD_WIDTH}
                  slideGap="md"
                  plugins={[wheelGesturesPlugin]}
                  emblaOptions={{
                    align: "center",
                  }}
                >
                  {activitiesAndTemplates.map(activityOrTemplate => {
                    const { offered_activities: activities } = values;
                    const activityValue = activities.find(a => {
                      if ("template_id" in activityOrTemplate) {
                        return a.id === activityOrTemplate.id;
                      } else {
                        return a.template_id === activityOrTemplate.id;
                      }
                    });
                    return (
                      <Carousel.Slide key={activityOrTemplate.id}>
                        <ActivityCard
                          {...{ activityOrTemplate }}
                          added={!!activityValue}
                          onChange={newActivity => {
                            if (newActivity) {
                              setFieldValue("offered_activities", [
                                ...activities,
                                newActivity,
                              ]);
                            } else if (activityValue) {
                              setFieldValue(
                                "offered_activities",
                                activities.filter(
                                  a => a.id !== activityValue.id,
                                ),
                              );
                            }
                          }}
                        />
                      </Carousel.Slide>
                    );
                  })}
                </Carousel>
              </Stack>
            )}
          </Transition>
        )}
        <Transition transition="pop" mounted={isDirty()}>
          {transitionStyle => (
            <Button
              type="submit"
              variant="filled"
              leftSection={<QRCodeIcon />}
              disabled={!values.invitee_name.trim()}
              loading={submitting}
              className={classes.addButton}
              style={transitionStyle}
            >
              create invite link
            </Button>
          )}
        </Transition>
      </Stack>
    </Box>
  );
};

export default NewInvitationForm;
