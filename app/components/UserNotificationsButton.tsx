import { ActionIcon, Loader } from "@mantine/core";

import { useWebPush } from "~/helpers/webPush";

const UserNotificationsButton: FC = () => {
  // == Web push
  const {
    subscription,
    registration,
    subscribe,
    subscribing,
    supported,
    loading,
  } = useWebPush();
  useDidUpdate(
    () => {
      if (supported && registration === null) {
        void subscribe();
      }
    },
    [supported, registration], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // == Menu
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <>
      {subscription === undefined ? (
        <ActionIcon size="lg" variant="light" loading>
          <NotificationIcon />
        </ActionIcon>
      ) : registration === null || subscription === null ? (
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
              onNotificationSent={() => {
                setMenuOpened(false);
              }}
            />
          </Menu.Dropdown>
        </Menu>
      )}
    </>
  );
};

export default UserNotificationsButton;

interface SendTestNotificationMenuItemProps {
  subscription: PushSubscription;
  onNotificationSent: () => void;
}

const SendTestNotificationMenuItem: FC<SendTestNotificationMenuItemProps> = ({
  subscription,
  onNotificationSent,
}) => {
  const { trigger, mutating } = useRouteMutation(
    routes.pushSubscriptions.test,
    {
      descriptor: "send test notification",
      onSuccess: onNotificationSent,
    },
  );

  return (
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
  );
};
