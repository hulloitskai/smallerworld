import { Text } from "@mantine/core";

import ContactLink from "./ContactLink";

export const openNotificationsTroubleshootingModal = (): void => {
  openModal({
    title: <>not getting notifications?</>,
    children: (
      <Stack>
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
