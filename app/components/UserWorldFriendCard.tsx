import { CopyButton, Loader, MenuItem, Overlay, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";

import SMSIcon from "~icons/heroicons/chat-bubble-left-ellipsis-20-solid";
import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";
import FrownIcon from "~icons/heroicons/face-frown-20-solid";
import PauseIcon from "~icons/heroicons/pause-20-solid";
import ResumeIcon from "~icons/heroicons/play-20-solid";
import QRCodeIcon from "~icons/heroicons/qr-code-20-solid";

import { prettyFriendName } from "~/helpers/friends";
import { type Activity, type UserWorldFriendProfile } from "~/types";

import ActivityCouponDrawer from "./ActivityCouponDrawer";
import EditFriendForm from "./EditFriendForm";
import WorldFriendInviteDrawer from "./WorldFriendInviteDrawer";

import classes from "./UserWorldFriendCard.module.css";

export interface UserWorldFriendCardProps {
  activitiesById: Record<string, Activity>;
  friend: UserWorldFriendProfile;
}

const UserWorldFriendCard: FC<UserWorldFriendCardProps> = ({
  activitiesById,
  friend,
}) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [activitiesDrawerOpened, setActivitiesDrawerOpened] = useState(false);
  const [inviteDrawerOpened, setInviteDrawerOpened] = useState(false);

  // == Offered activities
  const offeredActivities = useMemo(() => {
    const activities: Activity[] = [];
    friend.active_activity_coupons.forEach(coupon => {
      const activity = activitiesById[coupon.activity_id];
      if (activity) {
        activities.push(activity);
      }
    });
    return activities;
  }, [activitiesById, friend.active_activity_coupons]);

  // == Remove friend
  const { trigger: deleteFriend, mutating: deletingFriend } = useRouteMutation(
    routes.userWorldFriends.destroy,
    {
      params: {
        id: friend.id,
      },
      descriptor: "remove friend",
      onSuccess: () => {
        toast.success("friend removed");
        void mutateRoute(routes.userWorldFriends.index);
      },
    },
  );

  return (
    <>
      <Card className={cn("UserWorldFriendCard", classes.card)} withBorder>
        <Group gap={6} justify="space-between" className={classes.group}>
          <Group gap={8} miw={0} style={{ flexGrow: 1 }}>
            {!!friend.emoji && (
              <Box className={classes.emoji}>{friend.emoji}</Box>
            )}
            <Text ff="heading" fw={600}>
              {friend.name}
            </Text>
          </Group>
          <Group gap={2} style={{ flexShrink: 0 }}>
            {friend.paused_since ? (
              <Tooltip
                label={
                  <>
                    {prettyFriendName(friend)} will not see new posts you create
                  </>
                }
              >
                <Badge
                  className={classes.statusBadge}
                  color="red"
                  leftSection={<PauseIcon />}
                >
                  paused
                </Badge>
              </Tooltip>
            ) : (
              <Badge
                className={classes.statusBadge}
                color={friend.notifiable ? "gray" : "red"}
                leftSection={
                  friend.notifiable ? (
                    friend.notifiable === "sms" ? (
                      <SMSIcon />
                    ) : (
                      <PhoneIcon />
                    )
                  ) : (
                    <FrownIcon />
                  )
                }
                {...((!friend.notifiable || friend.notifiable === "push") && {
                  pl: 8,
                })}
              >
                {friend.notifiable
                  ? friend.notifiable === "sms"
                    ? "texts only"
                    : "installed"
                  : "can't notify"}
              </Badge>
            )}
            <Menu
              width={220}
              position="bottom-end"
              arrowOffset={20}
              trigger="click-hover"
              opened={menuOpened}
              onChange={setMenuOpened}
            >
              <Menu.Target>
                <ActionIcon variant="subtle" size="compact-xs">
                  <MenuIcon />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<EditIcon />}
                  onClick={() => {
                    openModal({
                      title: "change friend name",
                      children: (
                        <EditFriendForm
                          {...{ friend }}
                          onFriendUpdated={() => {
                            closeAllModals();
                          }}
                        />
                      ),
                    });
                  }}
                >
                  edit name
                </Menu.Item>
                <Menu.Item
                  leftSection={<RemoveIcon />}
                  onClick={() => {
                    openConfirmModal({
                      title: "really remove friend?",
                      children: <>you can't undo this action</>,
                      cancelProps: { variant: "light", color: "gray" },
                      groupProps: { gap: "xs" },
                      labels: {
                        confirm: "do it",
                        cancel: "wait nvm",
                      },
                      styles: {
                        header: {
                          minHeight: 0,
                          paddingBottom: 0,
                        },
                      },
                      onConfirm: () => {
                        void deleteFriend();
                      },
                    });
                  }}
                >
                  remove friend
                </Menu.Item>
                {friend.paused_since ? (
                  <UnpauseFriendMenuItem
                    friend={friend}
                    onFriendUnpaused={() => {
                      setMenuOpened(false);
                    }}
                  />
                ) : (
                  <PauseFriendMenuItem
                    friend={friend}
                    onFriendPaused={() => {
                      setMenuOpened(false);
                    }}
                  />
                )}
                <Menu.Item
                  leftSection={<QRCodeIcon />}
                  onClick={() => {
                    setInviteDrawerOpened(true);
                  }}
                >
                  re-invite friend
                </Menu.Item>
                {!!friend.phone_number && (
                  <>
                    <Menu.Divider />
                    <CopyPhoneNumberMenuItem
                      phoneNumber={friend.phone_number}
                    />
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
        <Group gap={8} wrap="wrap">
          {offeredActivities.map(activity => (
            <Badge
              className={classes.activityBadge}
              key={activity.id}
              variant="default"
              leftSection={activity.emoji ?? <CouponIcon />}
            >
              {activity.name}
            </Badge>
          ))}
          <Button
            className={classes.activityCouponButton}
            size="compact-xs"
            leftSection={<CouponIcon />}
            disabled={activitiesDrawerOpened}
            onClick={() => {
              setActivitiesDrawerOpened(true);
            }}
          >
            send a coupon
          </Button>
        </Group>
        <LoadingOverlay visible={deletingFriend} />
        {!friend.notifiable && (
          <Overlay
            blur={4}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: rem(8),
            }}
          >
            <Group gap={6} c="white">
              <Text size="sm">
                <span style={{ fontWeight: 700 }}>
                  {prettyFriendName(friend)}
                </span>{" "}
                didn&apos;t join your world{" "}
                <span className={classes.friendNotifiabilityEmoji}>😔</span>
              </Text>
            </Group>
            <Button
              variant="white"
              size="compact-xs"
              leftSection={<QRCodeIcon />}
              onClick={() => {
                setInviteDrawerOpened(true);
              }}
            >
              give them another chance{" "}
              <span className={classes.friendNotifiabilityButtonEmoji}>💞</span>
            </Button>
          </Overlay>
        )}
      </Card>
      <ActivityCouponDrawer
        {...{ friend }}
        opened={activitiesDrawerOpened}
        onClose={() => {
          setActivitiesDrawerOpened(false);
        }}
      />
      <WorldFriendInviteDrawer
        {...{ friend }}
        opened={inviteDrawerOpened}
        onClose={() => {
          setInviteDrawerOpened(false);
        }}
      />
    </>
  );
};

export default UserWorldFriendCard;

interface PauseFriendMenuItemProps {
  friend: UserWorldFriendProfile;
  onFriendPaused: () => void;
}

const PauseFriendMenuItem: FC<PauseFriendMenuItemProps> = ({
  friend,
  onFriendPaused,
}) => {
  const { trigger, mutating } = useRouteMutation(
    routes.userWorldFriends.pause,
    {
      params: {
        id: friend.id,
      },
      descriptor: "pause friend",
      onSuccess: () => {
        void mutateRoute(routes.userWorldFriends.index);
        toast.success(`${prettyFriendName(friend)} was paused`, {
          description: `they will not see new posts you create until you unpause them`,
        });
        onFriendPaused();
      },
    },
  );

  return (
    <MenuItem
      leftSection={mutating ? <Loader /> : <PauseIcon />}
      closeMenuOnClick={false}
      onClick={() => {
        void trigger();
      }}
    >
      pause friend
    </MenuItem>
  );
};

interface UnpauseFriendMenuItemProps {
  friend: UserWorldFriendProfile;
  onFriendUnpaused: () => void;
}

const UnpauseFriendMenuItem: FC<UnpauseFriendMenuItemProps> = ({
  friend,
  onFriendUnpaused,
}) => {
  const { trigger, mutating } = useRouteMutation(
    routes.userWorldFriends.unpause,
    {
      params: { id: friend.id },
      descriptor: "unpause friend",
      onSuccess: () => {
        void mutateRoute(routes.userWorldFriends.index);
        toast.success(`${prettyFriendName(friend)} was unpaused`, {
          description: `they will see new posts you create`,
        });
        onFriendUnpaused();
      },
    },
  );

  return (
    <MenuItem
      leftSection={mutating ? <Loader /> : <ResumeIcon />}
      closeMenuOnClick={false}
      onClick={() => {
        void trigger();
      }}
    >
      unpause friend
    </MenuItem>
  );
};

interface CopyPhoneNumberMenuItemProps {
  phoneNumber: string;
}

const CopyPhoneNumberMenuItem: FC<CopyPhoneNumberMenuItemProps> = ({
  phoneNumber,
}) => (
  <CopyButton value={phoneNumber}>
    {({ copied, copy }) => (
      <MenuItem
        leftSection={<PhoneIcon />}
        closeMenuOnClick={false}
        onClick={copy}
      >
        {copied ? "phone number copied!" : "copy phone number"}
      </MenuItem>
    )}
  </CopyButton>
);
