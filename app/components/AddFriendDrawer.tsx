import { Carousel } from "@mantine/carousel";
import { CopyButton, Popover, Text } from "@mantine/core";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { map } from "lodash-es";

import EmojiIcon from "~icons/heroicons/face-smile";
import QRCodeIcon from "~icons/heroicons/qr-code-20-solid";
import ShareIcon from "~icons/heroicons/share-20-solid";

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
import {
  type Activity,
  type ActivityTemplate,
  type JoinedUser,
  type JoinRequest,
  type WorldFriend,
} from "~/types";

import ActivityCard from "./ActivityCard";
import Drawer, { type DrawerProps } from "./Drawer";
import EmojiPopover from "./EmojiPopover";
import PlainQRCode from "./PlainQRCode";

import classes from "./AddFriendDrawer.module.css";
import "@mantine/carousel/styles.layer.css";

const ACTIVITY_CARD_WIDTH = 320;

export interface AddFriendDrawerProps extends Omit<DrawerProps, "children"> {
  fromJoinRequest?: JoinRequest;
  fromUser?: JoinedUser;
  onFriendCreated?: () => void;
}

const AddFriendDrawer: FC<AddFriendDrawerProps> = ({
  fromJoinRequest,
  fromUser,
  onFriendCreated,
  opened,
  ...otherProps
}) => {
  const [wheelGesturesPlugin] = useState(WheelGesturesPlugin);
  const [revealBackToHomeButton, setRevealBackToHomeButton] = useState(false);

  // == Joiner info
  const joinerInfo = useMemo<
    { name: string; phone_number: string } | undefined
  >(() => {
    const joiner = fromJoinRequest ?? fromUser;
    if (joiner) {
      return pick(joiner, "name", "phone_number");
    }
  }, [fromJoinRequest, fromUser]);

  // == Load activities
  const [showActivities, setShowActivities] = useState(false);
  const { data: activitiesData } = useRouteSWR<{
    activities: Activity[];
    activityTemplates: ActivityTemplate[];
  }>(routes.activities.index, {
    descriptor: "load activities",
    params: opened ? {} : null,
    keepPreviousData: true,
  });
  const { activities, activityTemplates } = activitiesData ?? {};
  const activitiesAndTemplates = useMemo(
    () => [...(activities ?? []), ...(activityTemplates ?? [])],
    [activities, activityTemplates],
  );

  // == Invitation URL
  const [invitationUrl, setInvitationUrl] = useState<string>();

  // == Create friend
  interface FormData {
    friend: WorldFriend;
  }
  interface FormValues {
    emoji: string;
    name: string;
    offered_activities: Activity[];
  }
  interface FormSubmission {
    friend: {
      emoji: string | null;
      name: string;
      phone_number: string | null;
      offered_activity_ids: string[];
    };
  }
  const initialValues = useMemo<FormValues>(
    () => ({
      emoji: "",
      name: joinerInfo?.name ?? "",
      offered_activities: [],
    }),
    [joinerInfo],
  );
  const {
    getInputProps,
    submit,
    values,
    submitting,
    setFieldValue,
    setInitialValues,
    reset,
    data,
  } = useForm<FormData, FormValues, (values: FormValues) => FormSubmission>({
    action: routes.worldFriends.create,
    descriptor: "invite friend",
    initialValues,
    transformValues: ({ emoji, name, offered_activities }) => ({
      friend: {
        emoji: emoji || null,
        name: name.trim(),
        phone_number: joinerInfo?.phone_number ?? null,
        offered_activity_ids: map(offered_activities, "id"),
      },
    }),
    onSuccess: ({ friend }) => {
      setShowActivities(false);
      void fetchRoute<{ inviteToken: string }>(routes.friends.inviteToken, {
        params: pick(friend, "id"),
        descriptor: "generate invite token",
      }).then(({ inviteToken }) => {
        const invitationPath = routes.invitations.show.path({
          invite_token: inviteToken,
        });
        setInvitationUrl(normalizeUrl(invitationPath));
      });
      void mutateRoute(routes.worldFriends.index);
      void mutateRoute(routes.worldJoinRequests.index);
      onFriendCreated?.();
      setTimeout(() => {
        setRevealBackToHomeButton(true);
      }, 3000);
    },
  });
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues, opened]); // eslint-disable-line react-hooks/exhaustive-deps
  const { friend } = data ?? {};

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
                  setFieldValue("emoji", emoji);
                }}
              >
                {({ open, opened }) => (
                  <ActionIcon
                    className={classes.emojiButton}
                    variant="default"
                    size={36}
                    disabled={!!friend}
                    onClick={() => {
                      if (values.emoji) {
                        setFieldValue("emoji", "");
                      } else {
                        open();
                      }
                    }}
                    mod={{ opened }}
                  >
                    {values.emoji ? (
                      <Box className={classes.emoji}>{values.emoji}</Box>
                    ) : (
                      <Box component={EmojiIcon} c="dimmed" />
                    )}
                  </ActionIcon>
                )}
              </EmojiPopover>
              <Stack gap="xs" style={{ flexGrow: 1 }}>
                <TextInput
                  {...getInputProps("name")}
                  placeholder="friend's name"
                  disabled={!!friend}
                />
                <Transition
                  transition="pop"
                  mounted={!isEmpty(values.offered_activities)}
                >
                  {style => (
                    <Group gap={8} wrap="wrap" {...{ style }}>
                      {values.offered_activities.map(activity => (
                        <Badge
                          className={classes.activityBadge}
                          key={activity.id}
                          variant="default"
                          leftSection={activity.emoji ?? <CouponIcon />}
                          {...(friend
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
              mounted={!isEmpty(activitiesAndTemplates) && !showActivities}
            >
              {style => (
                <Button
                  size="compact-sm"
                  leftSection={<CouponIcon />}
                  style={[style, { alignSelf: "center" }]}
                  disabled={!!friend}
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
                {style => (
                  <Stack
                    className={classes.activitiesContainer}
                    gap="sm"
                    {...{ style }}
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
            <Button
              type="submit"
              variant="filled"
              leftSection={<QRCodeIcon />}
              disabled={!values.name.trim() || !!friend}
              loading={submitting}
              className={classes.addButton}
            >
              create invite link
            </Button>
          </Stack>
        </form>
        {!friend && (
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
        {friend && (
          <>
            <Divider
              variant="dashed"
              mx="calc(var(--mantine-spacing-md) * -1)"
            />
            <Stack gap="lg" align="center">
              <Box ta="center">
                <Title order={3} lh="xs">
                  {possessive(friend.name)} invite link
                </Title>
                <Text size="sm" c="dimmed" display="block">
                  {joinerInfo ? (
                    <>
                      send your friend the link below, so they can add your page
                      to their home screen :)
                    </>
                  ) : (
                    <>
                      get your friend to scan this QR code, or send them the
                      link below, so they can add your page to their home screen
                      :)
                    </>
                  )}
                </Text>
              </Box>
              <Stack gap="xs" align="center">
                {joinerInfo ? (
                  <Popover shadow="md">
                    <Popover.Target>
                      <Button
                        component="a"
                        variant="filled"
                        leftSection={<PhoneIcon />}
                        mx="xs"
                      >
                        send via sms
                      </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <InviteViaSMSDropdownBody
                        {...{ invitationUrl, joinerInfo }}
                      />
                    </Popover.Dropdown>
                  </Popover>
                ) : (
                  <>
                    <InvitationQRCode {...{ invitationUrl }} />
                    <Divider label="or" w="100%" maw={120} mx="auto" />
                    <Center>
                      <SendInviteLinkButton {...{ invitationUrl }} />
                    </Center>
                  </>
                )}
              </Stack>
              <Transition transition="fade-up" mounted={revealBackToHomeButton}>
                {style => (
                  <Button
                    component={Link}
                    href={routes.world.show.path()}
                    leftSection={<BackIcon />}
                    {...{ style }}
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

export default AddFriendDrawer;

interface InvitationQRCodeProps {
  invitationUrl: string | undefined;
}

const InvitationQRCode: FC<InvitationQRCodeProps> = ({ invitationUrl }) => {
  return <>{invitationUrl && <PlainQRCode value={invitationUrl} />}</>;
};

interface InviteViaSMSDropdownBodyProps {
  joinerInfo: { name: string; phone_number: string };
  invitationUrl: string | undefined;
}

const InviteViaSMSDropdownBody: FC<InviteViaSMSDropdownBodyProps> = ({
  joinerInfo,
  invitationUrl,
}) => (
  <Stack gap="xs">
    <Text ta="center" ff="heading" fw={500}>
      send via:
    </Text>
    <Group justify="center" gap="sm">
      {MESSAGING_PLATFORMS.map(platform => (
        <Stack key={platform} gap={2} align="center" miw={60}>
          <ActionIcon
            component="a"
            target="_blank"
            rel="noopener noreferrer nofollow"
            variant="light"
            size="lg"
            {...(invitationUrl
              ? {
                  href: messageUri(
                    joinerInfo.phone_number,
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
);

interface SendInviteLinkButtonProps {
  invitationUrl: string | undefined;
}

const SendInviteLinkButton: FC<SendInviteLinkButtonProps> = ({
  invitationUrl,
}) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const invitationShareData = useInvitationShareData(invitationUrl);
  return (
    <Menu width={140} portalProps={{ target: vaulPortalTarget }}>
      <Menu.Target>
        <Button
          variant="filled"
          leftSection={<SendIcon />}
          disabled={!invitationUrl}
        >
          send invite link
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
