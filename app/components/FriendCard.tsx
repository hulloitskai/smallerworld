import { CopyButton, Loader, MenuItem, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";

import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";
import PauseIcon from "~icons/heroicons/pause-20-solid";
import ResumeIcon from "~icons/heroicons/play-20-solid";

import { type User, type WorldFriend } from "~/types";

import EditFriendForm from "./EditFriendForm";

import classes from "./FriendCard.module.css";

export interface FriendCardProps {
  currentUser: User;
  friend: WorldFriend;
}

const FriendCard: FC<FriendCardProps> = ({ currentUser, friend }) => {
  const prettyName = [friend.emoji, friend.name].filter(Boolean).join(" ");
  const [menuOpened, setMenuOpened] = useState(false);

  // == Join url
  const [joinUrl, setJoinUrl] = useState<string>();
  useEffect(() => {
    const joinPath = routes.users.show.path({
      handle: currentUser.handle,
      query: {
        friend_token: friend.access_token,
        intent: "join",
      },
    });
    const joinUrl = hrefToUrl(joinPath);
    setJoinUrl(joinUrl.toString());
  }, [currentUser.handle, friend.access_token]);

  // == Remove friend
  const { trigger: deleteFriend, mutating: deletingFriend } = useRouteMutation(
    routes.friends.destroy,
    {
      params: { id: friend.id },
      descriptor: "remove friend",
      onSuccess: () => {
        toast.success("friend removed");
        void mutateRoute(routes.friends.index);
      },
    },
  );

  return (
    <Card withBorder>
      <Group gap={6} justify="space-between" className={classes.group}>
        <Group gap={8} miw={0} style={{ flexGrow: 1 }}>
          <Box fz="xl">{friend.emoji}</Box>
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
              label={<>{prettyName} will not see new posts you create</>}
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
          <Menu width={170} opened={menuOpened} onChange={setMenuOpened}>
            <Menu.Target>
              <ActionIcon variant="subtle" size="compact-xs">
                <MenuIcon />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <CopyButton value={joinUrl ?? ""}>
                {({ copied, copy }) => (
                  <Menu.Item
                    closeMenuOnClick={false}
                    leftSection={copied ? <CopiedIcon /> : <CopyIcon />}
                    disabled={!joinUrl}
                    onClick={copy}
                  >
                    {copied ? "link copied!" : "copy invite link"}
                  </Menu.Item>
                )}
              </CopyButton>
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
      <LoadingOverlay visible={deletingFriend} />
    </Card>
  );
};

export default FriendCard;

interface PauseFriendItemProps {
  friend: WorldFriend;
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
      const prettyName = [friend.emoji, friend.name].filter(Boolean).join(" ");
      toast.success(`${prettyName} was paused`, {
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
  const { trigger, mutating } = useRouteMutation(routes.friends.unpause, {
    params: { id: friend.id },
    descriptor: "unpause friend",
    onSuccess: () => {
      void mutateRoute(routes.friends.index);
      const prettyName = [friend.emoji, friend.name].filter(Boolean).join(" ");
      toast.success(`${prettyName} was unpaused`, {
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
