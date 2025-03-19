import {
  ActionIcon,
  Button,
  type ButtonProps,
  CopyButton,
  Text,
} from "@mantine/core";
import QRCode from "react-qr-code";

import CopyIcon from "~icons/heroicons/clipboard-document-20-solid";
import CopiedIcon from "~icons/heroicons/clipboard-document-check-20-solid";
import EmojiIcon from "~icons/heroicons/face-smile";
import AddFriendIcon from "~icons/heroicons/user-plus-20-solid";

import { type Friend, type JoinRequest } from "~/types";

import EmojiPopover from "./EmojiPopover";

import classes from "./AddFriendButton.module.css";

export interface AddFriendButtonProps extends ModalBodyProps, ButtonProps {}

const AddFriendButton: FC<AddFriendButtonProps> = ({
  fromJoinRequest,
  ...otherProps
}) => {
  return (
    <Button
      leftSection={<AddFriendIcon />}
      onClick={() => {
        openModal({
          title: "add friend",
          children: <ModalBody {...{ fromJoinRequest }} />,
        });
      }}
      {...otherProps}
    >
      add friend
    </Button>
  );
};

export default AddFriendButton;

interface ModalBodyProps {
  fromJoinRequest?: JoinRequest;
}

const ModalBody: FC<ModalBodyProps> = ({ fromJoinRequest }) => {
  const currentUser = useAuthenticatedUser();
  const [createdFriend, setCreatedFriend] = useState<Friend | undefined>();
  const [createdFriendJoinUrl, setCreatedFriendJoinUrl] = useState<string>("");
  useEffect(() => {
    if (createdFriend?.access_token) {
      const joinPath = routes.users.show.path({
        handle: currentUser.handle,
        query: {
          friend_token: createdFriend.access_token,
          intent: "join",
        },
      });
      const joinUrl = new URL(joinPath, location.href);
      setCreatedFriendJoinUrl(joinUrl.toString());
    }
  }, [createdFriend?.access_token, currentUser.handle]);

  // == Form
  const initialValues = useMemo(
    () => ({
      emoji: "",
      name: fromJoinRequest?.name ?? "",
    }),
    [fromJoinRequest],
  );
  const {
    getInputProps,
    submit,
    values,
    submitting,
    setFieldValue,
    setInitialValues,
    reset,
  } = useForm({
    action: routes.friends.create,
    descriptor: "invite friend",
    initialValues,
    transformValues: ({ emoji, name }) => ({
      friend: {
        emoji: emoji || null,
        name: name.trim(),
        phone_number: fromJoinRequest?.phone_number ?? null,
      },
    }),
    onSuccess: ({ friend }: { friend: Friend }) => {
      setCreatedFriend(friend);
      void mutateRoute(routes.friends.index);
      void mutateRoute(routes.joinRequests.index);
    },
  });
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const shareJoinUrlViaSmsUri = useMemo(() => {
    if (!fromJoinRequest || !createdFriendJoinUrl) {
      return;
    }
    const message = `here's my smaller world invite link for you: ${createdFriendJoinUrl}`;
    return `sms:${fromJoinRequest.phone_number}?body=${encodeURIComponent(message)}`;
  }, [fromJoinRequest, createdFriendJoinUrl]);
  return (
    <Stack gap="lg">
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
                  disabled={!!createdFriend}
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
                    <Text size="xl">{values.emoji}</Text>
                  ) : (
                    <Box component={EmojiIcon} c="dimmed" />
                  )}
                </ActionIcon>
              )}
            </EmojiPopover>
            <TextInput
              {...getInputProps("name")}
              placeholder="friend's name"
              disabled={!!createdFriend}
              style={{ flexGrow: 1 }}
            />
            <Button
              type="submit"
              leftSection={<AddIcon />}
              style={{ alignSelf: "end" }}
              disabled={!values.name.trim() || !!createdFriend}
              loading={submitting}
              className={classes.addButton}
            >
              add
            </Button>
          </Group>
        </Stack>
      </form>
      {createdFriend && !!createdFriendJoinUrl && (
        <>
          <Divider />
          <Stack gap="lg" align="center">
            <Box ta="center">
              <Title order={3} lh="xs">
                {createdFriend.name}&apos;s invite link
              </Title>
              <Text size="sm" c="dimmed" display="block">
                {fromJoinRequest ? (
                  <>
                    send your friend the link below, so they can add your page
                    to their home screen :)
                  </>
                ) : (
                  <>
                    get your friend to scan this QR code, or send them the link
                    below, so they can add your page to their home screen :)
                  </>
                )}
              </Text>
            </Box>
            <Stack gap="xs" align="center">
              {!fromJoinRequest && (
                <QRCode
                  value={createdFriendJoinUrl}
                  size={160}
                  className={classes.qrCode}
                />
              )}
              {!!shareJoinUrlViaSmsUri && (
                <Button
                  component="a"
                  href={shareJoinUrlViaSmsUri}
                  leftSection={<PhoneIcon />}
                  mx="xs"
                >
                  send via sms
                </Button>
              )}
              <Divider label="or" w="100%" maw={120} mx="auto" />
              <CopyButton value={createdFriendJoinUrl}>
                {({ copy, copied }) => (
                  <Button
                    leftSection={
                      copied ? (
                        <Box component={CopiedIcon} />
                      ) : (
                        <Box component={CopyIcon} />
                      )
                    }
                    onClick={copy}
                    mx="xs"
                  >
                    {copied ? "copied!" : "copy invite link"}
                  </Button>
                )}
              </CopyButton>
            </Stack>
          </Stack>
        </>
      )}
    </Stack>
  );
};
