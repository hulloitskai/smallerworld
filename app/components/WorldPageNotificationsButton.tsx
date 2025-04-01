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
      {subscription === undefined ? (
        <ActionIcon size="lg" variant="light" loading>
          <NotificationIcon />
        </ActionIcon>
      ) : registration === null || subscription === null ? (
        <Card withBorder>
          <Stack>
            <Stack gap={6}>
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
              {/* TODO: Remove this after April 15, 2025 */}
              <Text size="xs" ta="center" maw={340} mx="auto">
                (march 31) if you are seeing this button for the second time, I
                AM SORRY i fucked up and now you have to redo this step :(
                <br /> if it doesn&apos;t work, you have to fully close and then
                re-open the app 💀
              </Text>
            </Stack>
          </Stack>
        </Card>
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
