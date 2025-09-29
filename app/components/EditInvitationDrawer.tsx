import { Text } from "@mantine/core";
import { map } from "lodash-es";

import EmojiIcon from "~icons/heroicons/face-smile";
import QRCodeIcon from "~icons/heroicons/qr-code-20-solid";

import { type Activity, type Invitation } from "~/types";

import Drawer, { type DrawerProps } from "./Drawer";
import EmojiPopover from "./EmojiPopover";
import InvitationQRCode from "./InvitationQRCode";
import SendInviteLinkButton from "./SendInviteLinkButton";

import classes from "./EditInvitationDrawer.module.css";
import "@mantine/carousel/styles.layer.css";

export interface EditInvitationDrawerProps
  extends Omit<DrawerProps, "children"> {
  activitiesById: Record<string, Activity>;
  invitation: Invitation;
  onInvitationUpdated?: (invitation: Invitation) => void;
}

const EditInvitationDrawer: FC<EditInvitationDrawerProps> = ({
  activitiesById,
  opened,
  invitation,
  onInvitationUpdated,
  ...otherProps
}) => {
  // == Form
  interface FormData {
    invitation: Invitation;
  }
  interface FormValues {
    invitee_emoji: string;
    invitee_name: string;
    offered_activities: Activity[];
  }
  interface FormSubmission {
    invitation: {
      invitee_emoji: string | null;
      invitee_name: string;
      offered_activity_ids: string[];
    };
  }
  const initialValues = useMemo<FormValues>(() => {
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
  }, [invitation, activitiesById]);
  const {
    getInputProps,
    submit,
    submitted,
    values,
    setFieldValue,
    reset,
    isDirty,
    submitting,
  } = useForm<FormData, FormValues, (values: FormValues) => FormSubmission>({
    action: routes.worldInvitations.update,
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
    onSuccess: ({ invitation }, { resetDirty }) => {
      resetDirty();
      void mutateRoute(routes.worldInvitations.index);
      onInvitationUpdated?.(invitation);
    },
  });
  useDidUpdate(() => {
    if (!opened && submitted) {
      reset();
    }
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Drawer
      title="invite a friend to your world"
      {...{ opened }}
      {...otherProps}
    >
      <Stack gap="lg" className={classes.stack}>
        <form onSubmit={submit}>
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
                      <Box className={classes.emoji}>
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
                          {...(invitation
                            ? { opacity: 0.5 }
                            : {
                                rightSection: (
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
                                ),
                              })}
                        >
                          {activity.name}
                        </Badge>
                      ))}
                    </Group>
                  )}
                </Transition>
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
            </Group>
          </Stack>
        </form>
        <Divider variant="dashed" mx="calc(var(--mantine-spacing-md) * -1)" />
        <Stack gap="lg" align="center">
          <Box ta="center">
            <Title order={3} lh="xs">
              {possessive(invitation.invitee_name)} invite link
            </Title>
            <Text size="sm" c="dimmed" display="block">
              get your friend to scan this QR code,
              <br />
              or send them the link using the button below
            </Text>
          </Box>
          <Stack gap="xs" align="center">
            <InvitationQRCode {...{ invitation }} />
            <Divider label="or" w="100%" maw={120} mx="auto" />
            <Center>
              <SendInviteLinkButton {...{ invitation }} />
            </Center>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default EditInvitationDrawer;
