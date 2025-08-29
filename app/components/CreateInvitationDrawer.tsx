import { Carousel } from "@mantine/carousel";
import { CopyButton, Image, Popover, Text } from "@mantine/core";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { map } from "lodash-es";

import EmojiIcon from "~icons/heroicons/face-smile";
import QRCodeIcon from "~icons/heroicons/qr-code-20-solid";
import ShareIcon from "~icons/heroicons/share-20-solid";

import bottomLeftArrowSrc from "~/assets/images/bottom-left-arrow.png";

import {
  formatInvitation,
  useInvitationShareData,
} from "~/helpers/invitations";
import {
  messageUri,
  MESSAGING_PLATFORM_TO_ICON,
  MESSAGING_PLATFORM_TO_LABEL,
  MESSAGING_PLATFORMS,
} from "~/helpers/messaging";
import { useShortlink } from "~/helpers/shortlinks";
import { useWorldActivities } from "~/helpers/world";
import { type Activity, type Invitation, type JoinRequest } from "~/types";

import ActivityCard from "./ActivityCard";
import Drawer, { type DrawerProps } from "./Drawer";
import EmojiPopover from "./EmojiPopover";
import PlainQRCode from "./PlainQRCode";

import classes from "./CreateInvitationDrawer.module.css";
import "@mantine/carousel/styles.layer.css";

const ACTIVITY_CARD_WIDTH = 320;

export interface CreateInvitationDrawerProps
  extends Omit<DrawerProps, "children"> {
  fromJoinRequest?: JoinRequest;
  onInvitationCreated?: (invitation: Invitation) => void;
}

const CreateInvitationDrawer: FC<CreateInvitationDrawerProps> = ({
  opened,
  fromJoinRequest,
  onInvitationCreated,
  ...otherProps
}) => {
  const [wheelGesturesPlugin] = useState(WheelGesturesPlugin);
  const [revealBackToHomeButton, setRevealBackToHomeButton] = useState(false);

  // == Load activities
  const [showActivities, setShowActivities] = useState(false);
  const { activitiesAndTemplates } = useWorldActivities({
    keepPreviousData: true,
  });

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
  const initialValues = useMemo<FormValues>(
    () => ({
      invitee_emoji: "",
      invitee_name: fromJoinRequest?.name ?? "",
      offered_activities: [],
    }),
    [fromJoinRequest],
  );
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const {
    getInputProps,
    submit,
    submitted,
    submitting,
    values,
    setFieldValue,
    isDirty,
    setInitialValues,
    reset,
  } = useForm<FormData, FormValues, (values: FormValues) => FormSubmission>({
    ...(invitation
      ? {
          action: routes.worldInvitations.update,
          params: { id: invitation.id },
          descriptor: "update invitation",
        }
      : {
          action: routes.worldInvitations.create,
          descriptor: "create invitation",
        }),
    initialValues,
    transformValues: ({ invitee_emoji, invitee_name, offered_activities }) => ({
      invitation: {
        join_request_id: fromJoinRequest?.id ?? null,
        invitee_emoji: invitee_emoji || null,
        invitee_name: invitee_name.trim(),
        offered_activity_ids: map(offered_activities, "id"),
      },
    }),
    onSuccess: ({ invitation }, { resetDirty }) => {
      setInvitation(invitation);
      setShowActivities(false);
      void mutateRoute(routes.worldInvitations.index);
      void mutateRoute(routes.worldJoinRequests.index);
      onInvitationCreated?.(invitation);
      resetDirty();
      setTimeout(() => {
        setRevealBackToHomeButton(true);
      }, 3000);
    },
  });
  useDidUpdate(() => {
    if (!opened && submitted) {
      setInitialValues(initialValues);
      setInvitation(null);
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
              </Stack>
            </Group>
            <Transition
              transition="pop"
              mounted={
                !isEmpty(activitiesAndTemplates) &&
                !showActivities &&
                !invitation
              }
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
                        give your friend a coupon they can redeem to do stuff
                        with you!
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
                  {invitation ? "save friend details" : "create invite link"}
                </Button>
              )}
            </Transition>
          </Stack>
        </form>
        {!invitation && (
          <>
            <Divider
              variant="dashed"
              mt={6}
              mx="calc(var(--mantine-spacing-md) * -1)"
            />
            <Box ta="center" mb="xs">
              <Title order={3} size="h6">
                how does this work?
              </Title>
              <Stack gap={4} maw={320} mx="auto" style={{ textWrap: "pretty" }}>
                <Text size="xs" c="dimmed">
                  a unique invite link will be created for your friend. when
                  they open it, they&apos;ll be prompted to add your page to
                  their home screen! (no account required)
                </Text>
                <Text size="xs" c="dimmed">
                  the name and emoji you set will be used to identify your
                  friend when they react to your posts :)
                </Text>
              </Stack>
            </Box>
          </>
        )}
        {invitation && (
          <>
            <Divider
              variant="dashed"
              mx="calc(var(--mantine-spacing-md) * -1)"
            />
            <Stack gap="lg" align="center">
              <Box ta="center">
                <Title order={3} lh="xs">
                  {possessive(invitation.invitee_name)} invite link
                </Title>
                <Text size="sm" c="dimmed" display="block">
                  {fromJoinRequest ? (
                    <>send your friend the invite link!</>
                  ) : (
                    <>
                      get your friend to scan this QR code,
                      <br />
                      or send them the link using the button below
                    </>
                  )}
                </Text>
              </Box>
              <Stack gap="xs" align="center">
                {fromJoinRequest ? (
                  <Stack gap={8} align="center">
                    <Image
                      src={bottomLeftArrowSrc}
                      className={classes.fromJoinRequestArrow}
                    />
                    <SendInviteLinkViaJoinRequestButton
                      {...{ invitation }}
                      joinRequest={fromJoinRequest}
                    />
                  </Stack>
                ) : (
                  <>
                    <InvitationQRCode {...{ invitation }} />
                    <Divider label="or" w="100%" maw={120} mx="auto" />
                    <Center>
                      <SendInviteLinkButton {...{ invitation }} />
                    </Center>
                  </>
                )}
              </Stack>
              <Transition transition="fade-up" mounted={revealBackToHomeButton}>
                {transitionStyle => (
                  <Button
                    component={Link}
                    href={routes.world.show.path()}
                    leftSection={<BackIcon />}
                    style={transitionStyle}
                  >
                    back to your world
                  </Button>
                )}
              </Transition>
            </Stack>
          </>
        )}
      </Stack>
    </Drawer>
  );
};

export default CreateInvitationDrawer;

interface InvitationQRCodeProps {
  invitation: Invitation;
}

const InvitationQRCode: FC<InvitationQRCodeProps> = ({ invitation }) => {
  const shortlink = useShortlink(
    () => routes.invitations.show.path({ id: invitation.id }),
    [invitation.id],
  );
  return <>{shortlink && <PlainQRCode value={shortlink} />}</>;
};

interface SendInviteLinkButtonProps {
  invitation: Invitation;
}

const SendInviteLinkButton: FC<SendInviteLinkButtonProps> = ({
  invitation,
}) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const invitationUrl = useNormalizeUrl(
    () => routes.invitations.show.path({ id: invitation.id }),
    [invitation.id],
  );
  const invitationShareData = useInvitationShareData(invitation);
  return (
    <Menu width={140} portalProps={{ target: vaulPortalTarget }}>
      <Menu.Target>
        <Button
          variant="filled"
          leftSection={<SendIcon />}
          disabled={!invitationUrl}
        >
          send invite link via...
        </Button>
      </Menu.Target>
      {!!invitationUrl && (
        <Menu.Dropdown>
          <CopyButton value={invitationUrl}>
            {({ copied, copy }) => (
              <Menu.Item
                leftSection={copied ? <CopiedIcon /> : <CopyIcon />}
                closeMenuOnClick={false}
                onClick={copy}
              >
                {copied ? "link copied!" : "copy link"}
              </Menu.Item>
            )}
          </CopyButton>
          {invitationShareData && (
            <Menu.Item
              leftSection={<ShareIcon />}
              closeMenuOnClick={false}
              onClick={() => {
                void navigator.share(invitationShareData);
              }}
            >
              share via...
            </Menu.Item>
          )}
        </Menu.Dropdown>
      )}
    </Menu>
  );
};

interface SendInviteLinkViaJoinRequestButtonProps {
  invitation: Invitation;
  joinRequest: JoinRequest;
}

const SendInviteLinkViaJoinRequestButton: FC<
  SendInviteLinkViaJoinRequestButtonProps
> = ({ invitation, joinRequest }) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const invitationUrl = useNormalizeUrl(
    () => routes.invitations.show.path({ id: invitation.id }),
    [invitation.id],
  );
  return (
    <Popover shadow="md" portalProps={{ target: vaulPortalTarget }}>
      <Popover.Target>
        <Button
          component="a"
          variant="filled"
          leftSection={<PhoneIcon />}
          mx="xs"
        >
          send invite link via...
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Text ta="center" ff="heading" fw={500}>
            send via:
          </Text>
          <Group justify="center" gap="sm">
            {MESSAGING_PLATFORMS.map(platform => (
              <Stack key={platform} gap={2} align="center" miw={60}>
                <ActionIcon
                  component="a"
                  variant="light"
                  size="lg"
                  {...(invitationUrl
                    ? {
                        href: messageUri(
                          joinRequest.phone_number,
                          formatInvitation(invitationUrl),
                          platform,
                        ),
                      }
                    : {
                        disabled: true,
                      })}
                >
                  <Box component={MESSAGING_PLATFORM_TO_ICON[platform]} />
                </ActionIcon>
                <Text size="xs" fw={500} ff="heading" c="dimmed">
                  {MESSAGING_PLATFORM_TO_LABEL[platform]}
                </Text>
              </Stack>
            ))}
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
