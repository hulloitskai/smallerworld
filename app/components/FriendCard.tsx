import { CopyButton, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";

import CopyIcon from "~icons/heroicons/clipboard-document-20-solid";
import CopiedIcon from "~icons/heroicons/clipboard-document-check-20-solid";
import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";

import { type FriendView, type User } from "~/types";

import EditFriendForm from "./EditFriendForm";

import classes from "./FriendCard.module.css";

export interface FriendCardProps {
  currentUser: User;
  friend: FriendView;
}

const FriendCard: FC<FriendCardProps> = ({ currentUser, friend }) => {
  const [menuOpened, setMenuOpened] = useState(false);

  // == Join url
  const [joinUrl, setJoinUrl] = useState<string>("");
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
        // void mutateRoute(routes.users.joined);
      },
    },
  );

  return (
    <Card withBorder>
      <Group gap={6} justify="space-between" className={classes.group}>
        <Group gap={8}>
          <Box fz="xl">{friend.emoji}</Box>
          <Text ff="heading" fw={600}>
            {friend.name}
          </Text>
        </Group>
        <Group gap={2}>
          {friend.notifiable && (
            <Badge
              color="gray"
              leftSection={<NotificationIcon />}
              className={classes.notifiableBadge}
            >
              notifiable
            </Badge>
          )}
          <Menu width={170} opened={menuOpened} onChange={setMenuOpened}>
            <Menu.Target>
              <ActionIcon variant="subtle" size="compact-xs">
                <MenuIcon />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <CopyButton value={joinUrl}>
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
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      <LoadingOverlay visible={deletingFriend} />
    </Card>
  );
};

export default FriendCard;
