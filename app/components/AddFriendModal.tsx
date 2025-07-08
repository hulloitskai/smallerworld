import { CopyButton, Popover, Text } from "@mantine/core";
import { type ModalSettings } from "@mantine/modals/lib/context";

import EmojiIcon from "~icons/heroicons/face-smile";
import QRCodeIcon from "~icons/heroicons/qr-code-20-solid";
import ShareIcon from "~icons/heroicons/share-20-solid";

import { formatJoinMessage, formatJoinTitle, useJoinUrl } from "~/helpers/join";
import {
  messageUri,
  MESSAGING_PLATFORM_TO_ICON,
  MESSAGING_PLATFORM_TO_LABEL,
  MESSAGING_PLATFORMS,
} from "~/helpers/messaging";
import {
  type Friend,
  type JoinedUser,
  type JoinRequest,
  type User,
} from "~/types";

import EmojiPopover from "./EmojiPopover";
import PlainQRCode from "./PlainQRCode";

import classes from "./AddFriendModal.module.css";

export interface AddFriendModalProps
  extends Omit<ModalSettings, "children">,
    ModalBodyProps {}

const openAddFriendModal = ({
  currentUser,
  fromJoinRequest,
  fromUser,
  ...otherProps
}: AddFriendModalProps) => {
  openModal({
    title: "invite a friend to your world",
    children: <ModalBody {...{ currentUser, fromJoinRequest, fromUser }} />,
    ...otherProps,
  });
};

export default openAddFriendModal;

interface ModalBodyProps {
  currentUser: User;
  fromJoinRequest?: JoinRequest;
  fromUser?: JoinedUser;
  onFriendCreated?: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
const ModalBody: FC<ModalBodyProps> = ({
  currentUser,
  fromJoinRequest,
  fromUser,
  onFriendCreated,
}) => {
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

  // == Form
  interface FormData {
    friend: Friend;
  }
  interface FormValues {
    emoji: string;
    name: string;
  }
  interface FormSubmission {
    friend: {
      emoji: string | null;
      name: string;
      phone_number: string | null;
    };
  }
  const initialValues = useMemo<FormValues>(
    () => ({
      emoji: "",
      name: joinerInfo?.name ?? "",
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
    action: routes.friends.create,
    descriptor: "invite friend",
    initialValues,
    transformValues: ({ emoji, name }) => ({
      friend: {
        emoji: emoji || null,
        name: name.trim(),
        phone_number: joinerInfo?.phone_number ?? null,
      },
    }),
    onSuccess: () => {
      void mutateRoute(routes.friends.index);
      void mutateRoute(routes.joinRequests.index);
      onFriendCreated?.();
      setTimeout(() => {
        setRevealBackToHomeButton(true);
      }, 3000);
    },
  });
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps
  const { friend } = data ?? {};

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
              disabled={!!friend}
              style={{ flexGrow: 1 }}
            />
          </Group>
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
          <Divider opacity={0.5} mt={6} />
          <Box ta="center" mb="xs">
            <Title order={3} size="h6">
              how does this work?
            </Title>
            <Stack gap={4} maw={320} mx="auto" style={{ textWrap: "pretty" }}>
              <Text size="xs" c="dimmed">
                a unique invite link will be created for your friend. when they
                open it, they&apos;ll be prompted to add your page to their home
                screen! (no account required)
              </Text>
              <Text size="xs" c="dimmed">
                the name and emoji you set will be used to identify your friend
                when they react to your posts :)
              </Text>
            </Stack>
          </Box>
        </>
      )}
      {friend && (
        <>
          <Divider />
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
                    get your friend to scan this QR code, or send them the link
                    below, so they can add your page to their home screen :)
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
                      {...{ currentUser, friend, joinerInfo }}
                    />
                  </Popover.Dropdown>
                </Popover>
              ) : (
                <>
                  <JoinQRCode {...{ currentUser, friend }} />
                  <Divider label="or" w="100%" maw={120} mx="auto" />
                  <Center>
                    <SendInviteLinkButton {...{ currentUser, friend }} />
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
  );
};

interface JoinQRCodeProps {
  currentUser: User;
  friend: Friend;
}

// eslint-disable-next-line react-refresh/only-export-components
const JoinQRCode: FC<JoinQRCodeProps> = ({ currentUser, friend }) => {
  const joinUrl = useJoinUrl(currentUser, friend);
  return <>{joinUrl && <PlainQRCode value={joinUrl} />}</>;
};

interface InviteViaSMSDropdownBodyProps {
  currentUser: User;
  friend: Friend;
  joinerInfo: { name: string; phone_number: string };
}

// eslint-disable-next-line react-refresh/only-export-components
const InviteViaSMSDropdownBody: FC<InviteViaSMSDropdownBodyProps> = ({
  currentUser,
  friend,
  joinerInfo,
}) => {
  const joinUrl = useJoinUrl(currentUser, friend);
  return (
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
              {...(joinUrl
                ? {
                    href: messageUri(
                      joinerInfo.phone_number,
                      formatJoinMessage(joinUrl),
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
};

interface SendInviteLinkButtonProps {
  currentUser: User;
  friend: Friend;
}

// eslint-disable-next-line react-refresh/only-export-components
const SendInviteLinkButton: FC<SendInviteLinkButtonProps> = ({
  currentUser,
  friend,
}) => {
  const joinUrl = useJoinUrl(currentUser, friend);
  const joinShareData = useMemo(() => {
    if (joinUrl) {
      const data: ShareData = {
        title: formatJoinTitle(),
        url: joinUrl,
      };
      if (navigator.canShare(data)) {
        return data;
      }
    }
  }, [joinUrl]);
  return (
    <Menu width={140}>
      <Menu.Target>
        <Button variant="filled" leftSection={<SendIcon />} disabled={!joinUrl}>
          send invite link
        </Button>
      </Menu.Target>
      {!!joinUrl && (
        <Menu.Dropdown>
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
        </Menu.Dropdown>
      )}
    </Menu>
  );
};
