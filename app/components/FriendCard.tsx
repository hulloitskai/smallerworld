import { CopyButton, Loader, MenuItem, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";

import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";
import PauseIcon from "~icons/heroicons/pause-20-solid";
import ResumeIcon from "~icons/heroicons/play-20-solid";
import QrCodeIcon from "~icons/heroicons/qr-code-20-solid";
import ShareIcon from "~icons/heroicons/share-20-solid";

import { prettyName } from "~/helpers/friends";
import { useJoinShareData, useJoinUrl } from "~/helpers/join";
import {
  type Activity,
  type Friend,
  type User,
  type WorldFriend,
} from "~/types";

import ActivityCouponDrawer from "./ActivityCouponDrawer";
import EditFriendForm from "./EditFriendForm";
import PlainQRCode from "./PlainQRCode";

import classes from "./FriendCard.module.css";

export interface FriendCardProps {
  activitiesById: Record<string, Activity>;
  currentUser: User;
  friend: WorldFriend;
}

const FriendCard: FC<FriendCardProps> = ({
  activitiesById,
  currentUser,
  friend,
}) => {
  const [menuOpened, setMenuOpened] = useState(false);

  // == Activities drawer
  const [activitiesDrawerOpened, setActivitiesDrawerOpened] = useState(false);
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
    routes.friends.destroy,
    {
      params: {
        id: friend.id,
      },
      descriptor: "remove friend",
      onSuccess: () => {
        toast.success("friend removed");
        void mutateRoute(routes.friends.index);
      },
    },
  );

  return (
    <>
      <Card className={cn("NotifiableFriendCard", classes.card)} withBorder>
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
            {friend.notifiable && !friend.paused && (
              <Badge
                className={classes.badge}
                color="gray"
                leftSection={<NotificationIcon />}
              >
                notifiable
              </Badge>
            )}
            {friend.paused && (
              <Tooltip
                label={
                  <>{prettyName(friend)} will not see new posts you create</>
                }
              >
                <Badge
                  className={classes.badge}
                  color="red"
                  leftSection={<PauseIcon />}
                >
                  paused
                </Badge>
              </Tooltip>
            )}
            <Menu
              width={180}
              position="bottom-end"
              arrowOffset={16}
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
                <SendJoinLinkMenuItem {...{ currentUser, friend }} />
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
                {friend.paused ? (
                  <UnpauseFriendItem
                    friend={friend}
                    onFriendUnpaused={() => {
                      setMenuOpened(false);
                    }}
                  />
                ) : (
                  <PauseFriendItem
                    friend={friend}
                    onFriendPaused={() => {
                      setMenuOpened(false);
                    }}
                  />
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
            variant="subtle"
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
      </Card>
      <ActivityCouponDrawer
        {...{ friend }}
        opened={activitiesDrawerOpened}
        onClose={() => {
          setActivitiesDrawerOpened(false);
        }}
      />
    </>
  );
};

export default FriendCard;

interface PauseFriendItemProps {
  friend: Friend;
  onFriendPaused: () => void;
}

const PauseFriendItem: FC<PauseFriendItemProps> = ({
  friend,
  onFriendPaused,
}) => {
  const { trigger, mutating } = useRouteMutation(routes.friends.pause, {
    params: {
      id: friend.id,
    },
    descriptor: "pause friend",
    onSuccess: () => {
      void mutateRoute(routes.friends.index);
      toast.success(`${prettyName(friend)} was paused`, {
        description: `they will not see new posts you create until you unpause them`,
      });
      onFriendPaused();
    },
  });

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

interface UnpauseFriendItemProps {
  friend: Friend;
  onFriendUnpaused: () => void;
}

const UnpauseFriendItem: FC<UnpauseFriendItemProps> = ({
  friend,
  onFriendUnpaused,
}) => {
  const { trigger, mutating } = useRouteMutation(routes.friends.unpause, {
    params: { id: friend.id },
    descriptor: "unpause friend",
    onSuccess: () => {
      void mutateRoute(routes.friends.index);
      toast.success(`${prettyName(friend)} was unpaused`, {
        description: `they will see new posts you create`,
      });
      onFriendUnpaused();
    },
  });

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

interface SendJoinLinkMenuItemProps {
  currentUser: User;
  friend: Friend;
}

const SendJoinLinkMenuItem: FC<SendJoinLinkMenuItemProps> = ({
  currentUser,
  friend,
}) => {
  const joinUrl = useJoinUrl(currentUser, friend);
  const joinShareData = useJoinShareData(joinUrl);
  return (
    <Menu.Sub arrowOffset={12} closeDelay={100}>
      <Menu.Sub.Target>
        <Menu.Sub.Item leftSection={<SendIcon />} disabled={!joinUrl}>
          send invite link
        </Menu.Sub.Item>
      </Menu.Sub.Target>
      {!!joinUrl && (
        <Menu.Sub.Dropdown>
          <CopyButton value={joinUrl}>
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
          <Menu.Item
            leftSection={<QrCodeIcon />}
            onClick={() => {
              openModal({
                title: "invite friend via QR code",
                children: (
                  <Stack align="center" justify="center" pb="md">
                    <Text size="sm" c="dimmed" display="block">
                      get your friend to scan this QR code, so they can add your
                      page to their home screen :)
                    </Text>
                    <PlainQRCode value={joinUrl} />
                  </Stack>
                ),
              });
            }}
          >
            show QR code
          </Menu.Item>
          {joinShareData && (
            <Menu.Item
              leftSection={<ShareIcon />}
              closeMenuOnClick={false}
              onClick={() => {
                void navigator.share(joinShareData);
              }}
            >
              share via...
            </Menu.Item>
          )}
        </Menu.Sub.Dropdown>
      )}
    </Menu.Sub>
  );
};
