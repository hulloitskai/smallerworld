import { ActionIcon, CopyButton, Text } from "@mantine/core";

import CopyIcon from "~icons/heroicons/clipboard-document-20-solid";
import CopiedIcon from "~icons/heroicons/clipboard-document-check-20-solid";

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
      <Group gap={6} className={classes.group}>
        <Box fz="xl">{friend.emoji}</Box>
        <Box style={{ flexGrow: 1 }}>
          <Text ff="heading" fw={600}>
            {friend.name}
          </Text>
        </Box>
        <Stack align="end" gap={2}>
          <CopyButton value={joinUrl}>
            {({ copied, copy }) => (
              <Button
                variant="subtle"
                size="compact-xs"
                leftSection={copied ? <CopiedIcon /> : <CopyIcon />}
                disabled={!joinUrl}
                onClick={copy}
              >
                {copied ? "link copied!" : "copy invite link"}
              </Button>
            )}
          </CopyButton>
          <Button
            variant="subtle"
            color="gray"
            size="compact-xs"
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
          </Button>
          {/* <Popover width={320}>
            <Popover.Target>
              <Button
                variant="subtle"
                size="compact-sm"
                leftSection={<PauseIcon />}
                color="gray"
              >
                pause
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              pausing a friend stops them from seeing your posts. this feature
              is coming soon!
            </Popover.Dropdown>
          </Popover> */}
        </Stack>
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
            {({ open }) => (
              <ActionIcon
                className={classes.emojiButton}
                variant="default"
                size={36}
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
