import { CopyButton, Popover, Text } from "@mantine/core";
import { type ModalSettings } from "@mantine/modals/lib/context";
import QRCode from "react-qr-code";

import EmojiIcon from "~icons/heroicons/face-smile";
import QRCodeIcon from "~icons/heroicons/qr-code-20-solid";

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

  // == Join url
  const [friendJoinUrl, setFriendJoinUrl] = useState<string>();

  // == Form
  const initialValues = useMemo(
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
  } = useForm({
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
    onSuccess: ({ friend }: { friend: Friend }) => {
      const joinPath = routes.users.show.path({
        handle: currentUser.handle,
        query: {
          friend_token: friend.access_token,
          intent: "join",
        },
      });
      const joinUrl = hrefToUrl(joinPath);
      setFriendJoinUrl(joinUrl.toString());
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
      {friend && !!friendJoinUrl && (
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
              {!joinerInfo && (
                <QRCode
                  value={friendJoinUrl}
                  size={160}
                  className={classes.qrCode}
                />
              )}
              {!!joinerInfo?.phone_number && !!friendJoinUrl && (
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
                              href={messageUri(
                                joinerInfo.phone_number,
                                formatJoinMessage(friendJoinUrl),
                                platform,
                              )}
                            >
                              <Box
                                component={MESSAGING_PLATFORM_TO_ICON[platform]}
                              />
                            </ActionIcon>
                            <Text size="xs" fw={500} ff="heading" c="dimmed">
                              {MESSAGING_PLATFORM_TO_LABEL[platform]}
                            </Text>
                          </Stack>
                        ))}
                      </Group>
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              )}
              <Divider label="or" w="100%" maw={120} mx="auto" />
              <CopyButton value={friendJoinUrl}>
                {({ copy, copied }) => (
                  <Button
                    variant="filled"
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

const formatJoinMessage = (joinUrl: string) =>
  `here's my smaller world invite link for you: ${joinUrl}`;
