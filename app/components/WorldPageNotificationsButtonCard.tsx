import { Popover, Text } from "@mantine/core";

import {
  useFriendNotificationSettings,
  useFriendNotificationSettingsForm,
} from "~/helpers/friends";
import { POST_TYPES } from "~/helpers/posts";
import { useSendTestNotification, useWebPush } from "~/helpers/webPush";
import { useWorldTheme } from "~/helpers/worldThemes";
import { type Friend, type FriendNotificationSettings } from "~/types";

import FriendNotificationSettingsForm, {
  FriendNotificationSettingsFormInputs,
} from "./FriendNotificationSettingsForm";
import { openNotificationsTroubleshootingModal } from "./NotificationsTroubleshootingModal";

export interface WorldPageNotificationsButtonCardProps
  extends Pick<NotificationPopoverBodyProps, "currentFriend"> {}

const WorldPageNotificationsButtonCard: FC<
  WorldPageNotificationsButtonCardProps
> = ({ currentFriend }) => {
  const worldTheme = useWorldTheme();

  // == Dropdown
  const [dropdownOpened, setDropdownOpened] = useState(false);

  // == Web push
  const {
    pushSubscription,
    pushRegistration,
    subscribe,
    subscribing,
    supported: webPushSupported,
    permission: webPushPermission,
    loading,
    subscribeError,
  } = useWebPush();

  // == Load notification settings
  const { notificationSettings } = useFriendNotificationSettings(
    currentFriend.access_token,
  );

  // == Notification settings form
  const [defaultNotificationSettings] = useState<FriendNotificationSettings>(
    () => ({ subscribed_post_types: POST_TYPES }),
  );
  const notificationSettingsForm = useFriendNotificationSettingsForm({
    currentFriend: currentFriend,
    notificationSettings: notificationSettings ?? defaultNotificationSettings,
  });

  return (
    <>
      {webPushSupported === false ||
      webPushPermission === "denied" ? null : pushSubscription === undefined ||
        pushRegistration === undefined ? (
        <Button loading>Placeholder button</Button>
      ) : pushSubscription === null || pushRegistration === null ? (
        <Card withBorder w="100%">
          <Stack>
            <FriendNotificationSettingsFormInputs
              form={notificationSettingsForm}
            />
            <Stack gap={4}>
              <Button
                variant="filled"
                loading={loading || subscribing}
                disabled={!webPushSupported}
                leftSection={<NotificationIcon />}
                onClick={() => {
                  if (notificationSettingsForm.isDirty()) {
                    notificationSettingsForm.submit();
                  }
                  void subscribe();
                }}
              >
                enable push notifications
              </Button>
              {!webPushSupported && (
                <Text size="xs" c="dimmed" ta="center">
                  push notifications not supported on this device :(
                </Text>
              )}
              {subscribeError && (
                <Text size="xs" c="red" ta="center">
                  {subscribeError.message}
                </Text>
              )}
            </Stack>
          </Stack>
          <LoadingOverlay visible={!notificationSettings} />
        </Card>
      ) : (
        <Popover
          width={300}
          shadow="md"
          opened={dropdownOpened}
          onChange={setDropdownOpened}
        >
          <Popover.Target>
            <Button
              leftSection={<NotificationIcon />}
              onClick={() => {
                setDropdownOpened(true);
              }}
              {...(worldTheme === "bakudeku" && {
                variant: "filled",
              })}
            >
              notification settings
            </Button>
          </Popover.Target>
          <Popover.Dropdown pb={0}>
            <NotificationPopoverBody
              {...{ currentFriend, pushSubscription, notificationSettings }}
              onClose={() => {
                setDropdownOpened(false);
              }}
            />
          </Popover.Dropdown>
        </Popover>
      )}
    </>
  );
};

export default WorldPageNotificationsButtonCard;

interface NotificationPopoverBodyProps {
  currentFriend: Friend;
  pushSubscription: PushSubscription;
  notificationSettings: FriendNotificationSettings | undefined;
  onClose: () => void;
}

const NotificationPopoverBody: FC<NotificationPopoverBodyProps> = ({
  currentFriend,
  pushSubscription,
  notificationSettings,
  onClose,
}) => {
  return (
    <Stack gap={0}>
      {notificationSettings ? (
        <FriendNotificationSettingsForm
          currentFriend={currentFriend}
          {...{ notificationSettings }}
        />
      ) : (
        <Skeleton h={100} />
      )}
      <Divider mt="md" mx="calc(-1 * var(--mantine-spacing-md))" />
      <Center py={8}>
        <SendTestNotificationButton {...{ pushSubscription, onClose }} />
      </Center>
    </Stack>
  );
};

interface SendTestNotificationButtonProps {
  pushSubscription: PushSubscription;
  onClose: () => void;
}

const SendTestNotificationButton: FC<SendTestNotificationButtonProps> = ({
  pushSubscription,
  onClose,
}) => {
  const { send, sent, sending } = useSendTestNotification();
  return (
    <Stack gap={2}>
      <Button
        loading={sending}
        variant="subtle"
        size="compact-sm"
        leftSection={<NotificationIcon />}
        onClick={() => {
          void send(pushSubscription);
        }}
      >
        send test notification
      </Button>
      {sent && (
        <Anchor
          component="button"
          size="xs"
          ta="center"
          onClick={() => {
            onClose();
            openNotificationsTroubleshootingModal();
          }}
        >
          didn&apos;t get anything?
        </Anchor>
      )}
    </Stack>
  );
};
