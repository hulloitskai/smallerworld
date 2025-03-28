import { Image, Popover, Text } from "@mantine/core";

import bottomLeftArrowSrc from "~/assets/images/bottom-left-arrow.png";

import { isMobileSafari, useBrowserDetection } from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa";
import { type User } from "~/types";

import { openInstallationInstructionsModal } from "./InstallationInstructionsModal";

import classes from "./WorldPageEnableNotificationsActionIcon.module.css";

export interface WorldPageEnableNotificationsActionIconProps extends BoxProps {
  currentUser: User;
}

const WorldPageEnableNotificationsActionIcon: FC<
  WorldPageEnableNotificationsActionIconProps
> = ({ currentUser, ...otherProps }) => {
  const [installerOpened, setInstallerOpened] = useState(false);
  const { install, installing } = useInstallPrompt();

  // == Browser detection
  const browserDetection = useBrowserDetection();

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
      <Popover
        width={245}
        opened={installerOpened}
        onChange={setInstallerOpened}
      >
        <Popover.Target>
          <ActionIcon
            variant="light"
            size="lg"
            loading={installing}
            disabled={
              !browserDetection ||
              (!isMobileSafari(browserDetection) && !install)
            }
            onClick={() => {
              if (install) {
                setInstallerOpened(true);
              } else {
                openInstallationInstructionsModal({
                  title: "pin this page to enable notifications",
                  pageName: "smaller world",
                  pageIcon: currentUser.page_icon,
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
              }
            }}
          >
            <NotificationIcon />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap={6}>
            <Text ff="heading" fw={600}>
              install this page to enable notifications &lt;3
            </Text>
            <Button
              leftSection={<InstallIcon />}
              disabled={!install}
              {...(!!install && {
                onClick: () => {
                  void install();
                },
              })}
            >
              install to home screen
            </Button>
          </Stack>
        </Popover.Dropdown>
      </Popover>
      <Image src={bottomLeftArrowSrc} className={classes.arrow} />
      <Text className={classes.arrowLabel}>enable notifs :)</Text>
    </Box>
  );
};

export default WorldPageEnableNotificationsActionIcon;
