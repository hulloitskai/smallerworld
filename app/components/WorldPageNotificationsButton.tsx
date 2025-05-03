import { Loader, Text } from "@mantine/core";

import { useSendTestNotification, useWebPush } from "~/helpers/webPush";

import { openNotificationsTroubleshootingModal } from "./NotificationsTroubleshootingModal";

const WorldPageNotificationsButton: FC = () => {
  // == Menu
  const [menuOpened, setMenuOpened] = useState(false);

  // == Web push
  const {
    subscription,
    registration,
    subscribe,
    subscribing,
    subscribeError,
    supported,
    loading,
  } = useWebPush();

  return (
    <>
      {supported === false ? null : subscription === undefined ||
        registration === undefined ? (
        <ActionIcon size="lg" variant="light" loading>
          <NotificationIcon />
        </ActionIcon>
      ) : subscription === null || registration === null ? (
        <Stack gap={4}>
          <Button
            variant="filled"
            loading={loading || subscribing}
            disabled={!supported}
            leftSection={<NotificationIcon />}
            onClick={() => {
              void subscribe();
            }}
          >
            enable push notifications
          </Button>
          {!supported && (
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
            <ActionIcon size="lg" variant="light">
              <NotificationIcon />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <SendTestNotificationMenuItem
              {...{ subscription }}
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

export default WorldPageNotificationsButton;

interface SendTestNotificationMenuItemProps {
  subscription: PushSubscription;
  onClose: () => void;
}

const SendTestNotificationMenuItem: FC<SendTestNotificationMenuItemProps> = ({
  subscription,
  onClose,
}) => {
  const { send, sent, sending } = useSendTestNotification();
  return (
    <>
      <Menu.Item
        closeMenuOnClick={false}
        leftSection={sending ? <Loader size="xs" /> : <NotificationIcon />}
        onClick={() => {
          void send(subscription);
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
