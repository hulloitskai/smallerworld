import { Text } from "@mantine/core";

import { useWebPush } from "~/helpers/webPush";

const UniversePageNotificationsButton: FC = () => {
  // == Web push
  const {
    pushSubscription,
    pushRegistration,
    subscribe,
    subscribing,
    supported: webPushSupported,
    loading,
    subscribeError,
  } = useWebPush();

  return (
    <>
      {webPushSupported === false ? null : pushSubscription === undefined ||
        pushRegistration === undefined ? (
        <Button loading>Placeholder button</Button>
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
      ) : null}
    </>
  );
};

export default UniversePageNotificationsButton;
