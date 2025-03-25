import { ActionIcon, Image, Popover, Text } from "@mantine/core";

import bottomLeftArrowSrc from "~/assets/images/bottom-left-arrow.png";

import { useInstallPromptEvent } from "~/helpers/pwa";
import { type User } from "~/types";

import { openInstallationInstructionsModal } from "./InstallationInstructionsModal";

import classes from "./WorldPageEnableNotificationsActionIcon.module.css";

export interface WorldPageEnableNotificationsActionIconProps extends BoxProps {
  user: User;
}

const WorldPageEnableNotificationsActionIcon: FC<
  WorldPageEnableNotificationsActionIconProps
> = ({ user, ...otherProps }) => {
  const installPromptEvent = useInstallPromptEvent();
  const [installing, setInstalling] = useState(false);
  return (
    <Box pos="relative" {...otherProps}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Single+Day&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Popover width={245} disabled={!installPromptEvent}>
        <Popover.Target>
          <ActionIcon
            variant="light"
            size="lg"
            loading={installPromptEvent === undefined || installing}
            onClick={() => {
              if (installPromptEvent) {
                return;
              }
              openInstallationInstructionsModal({
                title: "pin this page to enable notifications",
                pageName: "smaller world",
                pageIcon: user.page_icon,
                children: (
                  <Text size="sm" ta="center" maw={300} mx="auto">
                    pin this page to your home screen so you can{" "}
                    <span style={{ fontWeight: 600 }}>
                      get notified when friends react to your posts
                    </span>
                    !
                  </Text>
                ),
              });
            }}
          >
            <NotificationIcon />
          </ActionIcon>
        </Popover.Target>
        {installPromptEvent && (
          <Popover.Dropdown>
            <Stack gap={6}>
              <Text ff="heading" fw={600}>
                install this page to enable notifications &lt;3
              </Text>
              <Button
                leftSection={<InstallIcon />}
                onClick={() => {
                  setInstalling(true);
                  void installPromptEvent.prompt().then(() => {
                    setInstalling(false);
                  });
                }}
              >
                install to home screen
              </Button>
            </Stack>
          </Popover.Dropdown>
        )}
      </Popover>
      <Image src={bottomLeftArrowSrc} className={classes.arrow} />
      <Text className={classes.arrowLabel}>enable notifs :)</Text>
    </Box>
  );
};

export default WorldPageEnableNotificationsActionIcon;
