import { Text } from "@mantine/core";

import { useWebPush } from "~/helpers/webPush";

const UniversePageNotificationsButton: FC = () => {
  // == Web push
  const {
    subscription,
    registration,
    subscribe,
    subscribing,
    supported,
    loading,
    subscribeError,
  } = useWebPush();

  return (
    <>
      {supported === false ? null : subscription === undefined ||
        registration === undefined ? (
        <Button loading>Placeholder button</Button>
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
      ) : null}
    </>
  );
};

export default UniversePageNotificationsButton;
