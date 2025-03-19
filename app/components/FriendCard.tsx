import { ActionIcon, CopyButton, Text } from "@mantine/core";

import CopyIcon from "~icons/heroicons/clipboard-document-20-solid";
import CopiedIcon from "~icons/heroicons/clipboard-document-check-20-solid";
import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";

// import PauseIcon from "~icons/heroicons/pause-20-solid";
import { type Friend } from "~/types";

import EmojiPopover from "./EmojiPopover";

import classes from "./FriendCard.module.css";

export interface FriendCardProps {
  friend: Friend;
}

const FriendCard: FC<FriendCardProps> = ({ friend }) => {
  const currentUser = useAuthenticatedUser();
  const [joinUrl, setJoinUrl] = useState<string>("");
  useEffect(() => {
    const joinPath = routes.users.show.path({
      handle: currentUser.handle,
      query: {
        friend_token: friend.access_token,
        intent: "join",
      },
    });
    const joinUrl = new URL(joinPath, location.origin);
    setJoinUrl(joinUrl.toString());
  }, [currentUser.handle, friend.access_token]);

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
              variant="subtle"
              color="gray"
              leftSection={<NotificationIcon />}
              className={classes.notifiableBadge}
            >
              notifiable
            </Badge>
          )}
          <Menu width={170}>
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
                    title: "edit friend name",
                    children: (
                      <EditFriendModalBody
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
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Card>
  );
};

export default FriendCard;

interface EditFriendModalBodyProps {
  friend: Friend;
  onFriendUpdated?: (friend: Friend) => void;
}

const EditFriendModalBody: FC<EditFriendModalBodyProps> = ({
  friend,
  onFriendUpdated,
}) => {
  const initialValues = useMemo(
    () => ({
      emoji: friend.emoji,
      name: friend.name,
    }),
    [friend],
  );
  const {
    submit,
    values,
    submitting,
    getInputProps,
    setFieldValue,
    setInitialValues,
    reset,
  } = useForm({
    action: routes.friends.update,
    params: { id: friend.id },
    descriptor: "update friend",
    initialValues,
    onSuccess: ({ friend }: { friend: Friend }) => {
      mutateRoute(routes.friends.index);
      onFriendUpdated?.(friend);
    },
  });
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
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
                mod={{ opened }}
                onClick={() => {
                  if (values.emoji) {
                    setFieldValue("emoji", "");
                  } else {
                    open();
                  }
                }}
              >
                {values.emoji ? (
                  <Text size="xl">{values.emoji}</Text>
                ) : (
                  <Box component={EmojiIcon} c="dimmed" />
                )}
              </ActionIcon>
            )}
          </EmojiPopover>
          <TextInput
            {...getInputProps("name")}
            placeholder={friend.name}
            style={{ flexGrow: 1 }}
          />
        </Group>
        <Button
          type="submit"
          loading={submitting}
          leftSection={<SaveIcon />}
          style={{ alignSelf: "center" }}
        >
          save
        </Button>
      </Stack>
    </form>
  );
};
