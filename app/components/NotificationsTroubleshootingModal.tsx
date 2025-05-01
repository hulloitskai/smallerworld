import { type ButtonProps, Text } from "@mantine/core";

import FixIcon from "~icons/heroicons/wrench-screwdriver-20-solid";

import { useSendTestNotification, useWebPush } from "~/helpers/webPush";

import ContactLink from "./ContactLink";

export const openNotificationsTroubleshootingModal = (): void => {
  openModal({
    title: <>not getting notifications?</>,
    children: (
      <Stack>
        <Text>try this:</Text>
        <ResetPushSubscriptionButton style={{ alignSelf: "center" }} />
        <Text>
          if you&apos;re on android, make sure that your{" "}
          <span style={{ fontWeight: 700 }}>Google Chrome</span> notifications
          are enabled in your system settings.
        </Text>
        <Text>
          still stuck?{" "}
          <ContactLink
            type="sms"
            body="i'm not getting notifications on smaller world!"
          >
            get help!
          </ContactLink>
        </Text>
      </Stack>
    ),
  });
};

// eslint-disable-next-line react-refresh/only-export-components
const ResetPushSubscriptionButton: FC<ButtonProps> = props => {
  const { subscribe, loading } = useWebPush();
  const { send: sendTestNotification, sending: sendingTestNotification } =
    useSendTestNotification();
  return (
    <Button
      variant="filled"
      leftSection={<FixIcon />}
      loading={loading || sendingTestNotification}
      onClick={() => {
        void subscribe().then(sendTestNotification);
      }}
      {...props}
    >
      reset push notifications
    </Button>
  );
};
