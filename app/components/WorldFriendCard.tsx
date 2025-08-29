import { Loader, MenuItem, Overlay, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";

import SMSIcon from "~icons/heroicons/chat-bubble-left-ellipsis-20-solid";
import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";
import FrownIcon from "~icons/heroicons/face-frown-20-solid";
import PauseIcon from "~icons/heroicons/pause-20-solid";
import ResumeIcon from "~icons/heroicons/play-20-solid";
import QRCodeIcon from "~icons/heroicons/qr-code-20-solid";

import { prettyFriendName } from "~/helpers/friends";
import { type Activity, type WorldFriend } from "~/types";

import ActivityCouponDrawer from "./ActivityCouponDrawer";
import EditFriendForm from "./EditFriendForm";
import WorldFriendInviteDrawer from "./WorldFriendInviteDrawer";

import classes from "./WorldFriendCard.module.css";

export interface WorldFriendCardProps {
  activitiesById: Record<string, Activity>;
  friend: WorldFriend;
}

const WorldFriendCard: FC<WorldFriendCardProps> = ({
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
    routes.worldFriends.destroy,
    {
      params: {
        id: friend.id,
      },
      descriptor: "remove friend",
      onSuccess: () => {
        toast.success("friend removed");
        void mutateRoute(routes.worldFriends.index);
      },
    },
  );

  return (
    <>
      <Card className={cn("WorldFriendCard", classes.card)} withBorder>
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
            {friend.paused ? (
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
                <Menu.Item
                  leftSection={<QRCodeIcon />}
                  onClick={() => {
                    setInviteDrawerOpened(true);
                  }}
                >
                  re-invite friend
                </Menu.Item>
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
                <span
                  style={{
                    marginLeft: rem(1),
                    fontFamily: "var(--font-family-emoji)",
                  }}
                >
                  😔
                </span>
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
              <span
                style={{
                  fontFamily: "var(--font-family-emoji)",
                  marginLeft: rem(4),
                }}
              >
                💞
              </span>
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

export default WorldFriendCard;

interface PauseFriendItemProps {
  friend: WorldFriend;
  onFriendPaused: () => void;
}

const PauseFriendItem: FC<PauseFriendItemProps> = ({
  friend,
  onFriendPaused,
}) => {
  const { trigger, mutating } = useRouteMutation(routes.worldFriends.pause, {
    params: {
      id: friend.id,
    },
    descriptor: "pause friend",
    onSuccess: () => {
      void mutateRoute(routes.worldFriends.index);
      toast.success(`${prettyFriendName(friend)} was paused`, {
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
  friend: WorldFriend;
  onFriendUnpaused: () => void;
}

const UnpauseFriendItem: FC<UnpauseFriendItemProps> = ({
  friend,
  onFriendUnpaused,
}) => {
  const { trigger, mutating } = useRouteMutation(routes.worldFriends.unpause, {
    params: { id: friend.id },
    descriptor: "unpause friend",
    onSuccess: () => {
      void mutateRoute(routes.worldFriends.index);
      toast.success(`${prettyFriendName(friend)} was unpaused`, {
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

// interface SendInvitationMenuItemProps {
//   invitationUrl: string | undefined;
// }

// const SendInvitationMenuItem: FC<SendInvitationMenuItemProps> = ({
//   invitationUrl,
// }) => {
//   const invitationShareData = useInvitationShareData(invitationUrl);
//   return (
//     <Menu.Sub
//       position="left-start"
//       arrowOffset={12}
//       closeDelay={100}
//       disabled={!invitationUrl}
//     >
//       <Menu.Sub.Target>
//         <Menu.Sub.Item
//           leftSection={invitationUrl ? <SendIcon /> : <Loader size="xs" />}
//         >
//           send invite link
//         </Menu.Sub.Item>
//       </Menu.Sub.Target>
//       <Menu.Sub.Dropdown>
//         <CopyButton value={invitationUrl ?? ""}>
//           {({ copied, copy }) => (
//             <Menu.Item
//               leftSection={copied ? <CopiedIcon /> : <CopyIcon />}
//               closeMenuOnClick={false}
//               disabled={!invitationUrl}
//               onClick={copy}
//             >
//               {copied ? "link copied!" : "copy link"}
//             </Menu.Item>
//           )}
//         </CopyButton>
//         <Menu.Item
//           leftSection={<QrCodeIcon />}
//           disabled={!invitationUrl}
//           onClick={() => {
//             if (!invitationUrl) {
//               throw new Error("Missing invitation URL");
//             }
//             openModal({
//               title: "invite friend via QR code",
//               children: (
//                 <Stack align="center" justify="center" pb="md">
//                   <Text size="sm" c="dimmed" display="block">
//                     get your friend to scan this QR code, so they can add your
//                     page to their home screen :)
//                   </Text>
//                   <PlainQRCode value={invitationUrl} />
//                 </Stack>
//               ),
//             });
//           }}
//         >
//           show QR code
//         </Menu.Item>
//         {invitationShareData && (
//           <Menu.Item
//             leftSection={<ShareIcon />}
//             closeMenuOnClick={false}
//             onClick={() => {
//               void navigator.share(invitationShareData);
//             }}
//           >
//             share via...
//           </Menu.Item>
//         )}
//       </Menu.Sub.Dropdown>
//     </Menu.Sub>
//   );
// };
