import { type ButtonProps } from "@mantine/core";

import { useWebPush } from "~/helpers/webPush";

export interface UserPushNotificationsButtonProps extends ButtonProps {}

const UserPushNotificationsButton: FC<UserPushNotificationsButtonProps> = ({
  ...otherProps
}) => {
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

  const { trigger, mutating } = useRouteMutation(
    routes.pushSubscriptions.test,
    {
      descriptor: "send test notification",
    },
  );

  return (
    <Button
      loading={loading || subscribing || mutating}
      disabled={!supported}
      leftSection={<NotificationIcon />}
      onClick={() => {
        if (registration && subscription) {
          void trigger({
            push_subscription: {
              endpoint: subscription.endpoint,
            },
          });
        } else {
          void subscribe();
        }
      }}
      {...otherProps}
    >
      {registration ? "send test notification" : "enable push notifications"}
    </Button>
  );
};

export default UserPushNotificationsButton;
