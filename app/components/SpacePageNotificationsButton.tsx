import {
  type ActionIconProps,
  type ButtonProps,
  Loader,
  Text,
} from "@mantine/core";

import { useSendTestNotification, useWebPush } from "~/helpers/webPush";

import { openNotificationsTroubleshootingModal } from "./NotificationsTroubleshootingModal";

export interface SpacePageNotificationsButtonProps
  extends Omit<ButtonProps & ActionIconProps, "children"> {}

const SpacePageNotificationsButton: FC<
  SpacePageNotificationsButtonProps
> = props => {
  // == Menu
  const [menuOpened, setMenuOpened] = useState(false);

  // == Web push
  const {
    pushSubscription,
    pushRegistration,
    subscribe,
    subscribing,
    subscribeError,
    supported: webPushSupported,
    permission: webPushPermission,
    loading,
  } = useWebPush();

  return (
    <>
      {webPushSupported === false ||
      webPushPermission === "denied" ? null : pushSubscription === undefined ||
        pushRegistration === undefined ? (
        <Button loading {...props}>
          notification settings
        </Button>
      ) : pushSubscription === null || pushRegistration === null ? (
        <Stack gap={4}>
          <Button
            variant="filled"
            loading={loading || subscribing}
            disabled={!webPushSupported}
            leftSection={<NotificationIcon />}
            onClick={() => {
              void subscribe();
            }}
            {...props}
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
      ) : (
        <Menu opened={menuOpened} onChange={setMenuOpened}>
          <Menu.Target>
            <Button leftSection={<NotificationIcon />}>
              notification settings
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <SendTestNotificationMenuItem
              {...{ pushSubscription }}
              onClose={() => {
                setMenuOpened(false);
              }}
            />
          </Menu.Dropdown>
        </Menu>
      )}
    </>
  );
};

export default SpacePageNotificationsButton;

interface SendTestNotificationMenuItemProps {
  pushSubscription: PushSubscription;
  onClose: () => void;
}

const SendTestNotificationMenuItem: FC<SendTestNotificationMenuItemProps> = ({
  pushSubscription,
  onClose,
}) => {
  const { send, sent, sending } = useSendTestNotification();
  return (
    <>
      <Menu.Item
        closeMenuOnClick={false}
        leftSection={sending ? <Loader size="xs" /> : <NotificationIcon />}
        onClick={() => {
          void send(pushSubscription);
        }}
      >
        send test notification
      </Menu.Item>
      {sent && (
        <Menu.Item
          component="div"
          disabled
          pt={2}
          pb={6}
          bg="transparent"
          style={{ cursor: "default" }}
        >
          <Anchor
            component="button"
            size="xs"
            ta="center"
            mx="auto"
            display="block"
            onClick={() => {
              onClose();
              openNotificationsTroubleshootingModal();
            }}
          >
            didn&apos;t get anything?
          </Anchor>
        </Menu.Item>
      )}
    </>
  );
};
