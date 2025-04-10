import { Loader, Text } from "@mantine/core";

import { useWebPush } from "~/helpers/webPush";

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
    supported,
    loading,
  } = useWebPush();

  return (
    <>
      {registration === undefined || subscription === undefined ? (
        <Skeleton radius="xl" style={{ width: "unset" }}>
          <ActionIcon size="lg" variant="light">
            <NotificationIcon />
          </ActionIcon>
        </Skeleton>
      ) : registration === null || subscription === null ? (
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
  const { trigger, mutating, data } = useRouteMutation<{}>(
    routes.pushSubscriptions.test,
    {
      descriptor: "send test notification",
    },
  );

  return (
    <>
      <Menu.Item
        closeMenuOnClick={false}
        leftSection={mutating ? <Loader size="xs" /> : <NotificationIcon />}
        onClick={() => {
          void trigger({
            push_subscription: {
              endpoint: subscription.endpoint,
            },
          });
        }}
      >
        send test notification
      </Menu.Item>
      {data && (
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
