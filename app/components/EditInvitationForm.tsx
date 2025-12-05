import { map } from "lodash-es";

import QRCodeIcon from "~icons/heroicons/qr-code-20-solid";

import { useUserWorldActivities } from "~/helpers/userWorld";
import { type Activity, type Invitation } from "~/types";

import EmojiPopover from "./EmojiPopover";

import classes from "./EditInvitationForm.module.css";

export interface EditInvitationFormProps extends BoxProps {
  invitation: Invitation;
  onInvitationUpdated?: (invitation: Invitation) => void;
}

const EditInvitationForm: FC<EditInvitationFormProps> = ({
  invitation,
  onInvitationUpdated,
  className,
  ...otherProps
}) => {
  const { activities } = useUserWorldActivities({ keepPreviousData: true });
  const activitiesById = useMemo(() => keyBy(activities, "id"), [activities]);

  // == Form
  const initialValues = useMemo(() => {
    const offeredActivities: Activity[] = [];
    for (const id of invitation.offered_activity_ids) {
      const activity = activitiesById[id];
      if (activity) {
        offeredActivities.push(activity);
      }
    }
    return {
      invitee_emoji: invitation.invitee_emoji ?? "",
      invitee_name: invitation.invitee_name,
      offered_activities: offeredActivities,
    };
  }, [activitiesById, invitation]);
  const {
    getInputProps,
    submit,
    values,
    setFieldValue,
    isDirty,
    submitting,
    initialize,
  } = useForm({
    action: routes.userWorldInvitations.update,
    params: { id: invitation.id },
    descriptor: "update invitation",
    initialValues,
    transformValues: ({ invitee_emoji, invitee_name, offered_activities }) => ({
      invitation: {
        invitee_emoji: invitee_emoji || null,
        invitee_name: invitee_name.trim(),
        offered_activity_ids: map(offered_activities, "id"),
      },
    }),
    onSuccess: ({ invitation }: { invitation: Invitation }, { resetDirty }) => {
      resetDirty();
      void mutateRoute(routes.userWorldInvitations.index);
      onInvitationUpdated?.(invitation);
    },
  });
  useDidUpdate(() => {
    console.debug(
      "Re-initializing EditInvitationForm from updated initialValues",
      initialValues,
    );
    initialize(initialValues);
  }, [initialValues, initialize]);

  return (
    <Box
      component="form"
      onSubmit={submit}
      className={cn("EditInvitationForm", className)}
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
                  <Box className="emoji" fz="lg">
                    {values.invitee_emoji}
                  </Box>
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
            {/* <Transition
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
            </Transition> */}
          </Stack>
        </Group>
        <Transition transition="pop" mounted={!invitation || isDirty()}>
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
              save friend details
            </Button>
          )}
        </Transition>
      </Stack>
    </Box>
  );
};

export default EditInvitationForm;
