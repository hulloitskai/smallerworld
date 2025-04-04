import { Affix, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import {
  canOpenUrlInMobileSafari,
  isMobileStandaloneBrowser,
  useBrowserDetection,
} from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa";
import {
  openUserPageInstallationInstructionsInMobileSafari,
  useUserPageDialogOpened,
} from "~/helpers/userPages";
import { type Friend, type User } from "~/types/generated";

import BrowserNotSupportedText from "./BrowserNotSupportedText";
import { openUserPageInstallationInstructionsModal } from "./UserPageInstallationInstructionsModal";

import classes from "./UserPageInstallAlert.module.css";

export interface UserPageInstallAlertProps {
  currentFriend: Friend;
  user: User;
}

const ALERT_INSET = "var(--mantine-spacing-md)";

const UserPageInstallAlert: FC<UserPageInstallAlertProps> = ({
  currentFriend,
  user,
}) => {
  const { modals } = useModals();
  const pageDialogOpened = useUserPageDialogOpened();

  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == Install to home screen
  const { install, installing } = useInstallPrompt();

  return (
    <Affix
      zIndex={180}
      position={{
        bottom: `calc(${ALERT_INSET} + var(--safe-area-inset-bottom, 0px))`,
        left: ALERT_INSET,
        right: ALERT_INSET,
      }}
    >
      <Transition
        transition="pop"
        mounted={isEmpty(modals) && !pageDialogOpened}
        enterDelay={100}
      >
        {style => (
          <Alert
            variant="filled"
            icon={<NotificationIcon />}
            title="join my smaller world :)"
            className={classes.alert}
            {...{ style }}
          >
            <Stack gap={8} align="start">
              <Text inherit>
                life updates, personal invitations, poems, and more!
              </Text>
              <Group gap="xs">
                <Button<"a" | "button">
                  variant="white"
                  size="compact-sm"
                  leftSection={<InstallIcon />}
                  className={classes.button}
                  loading={installing}
                  disabled={
                    !browserDetection ||
                    (!install &&
                      !isMobileStandaloneBrowser(browserDetection) &&
                      !canOpenUrlInMobileSafari(browserDetection))
                  }
                  onClick={() => {
                    if (install) {
                      void install();
                    } else if (
                      !!browserDetection &&
                      isMobileStandaloneBrowser(browserDetection)
                    ) {
                      openUserPageInstallationInstructionsModal({ user });
                    } else {
                      openUserPageInstallationInstructionsInMobileSafari(
                        user,
                        currentFriend,
                      );
                    }
                  }}
                >
                  pin this page
                </Button>
                <BrowserNotSupportedText />
              </Group>
            </Stack>
          </Alert>
        )}
      </Transition>
    </Affix>
  );
};

export default UserPageInstallAlert;
