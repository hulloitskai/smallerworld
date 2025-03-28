import { Affix, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import {
  canOpenUrlInMobileSafari,
  isAndroid,
  isDesktop,
  isInAppBrowser,
  isIos,
  isMobileSafari,
  useBrowserDetection,
} from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa";
import {
  openUserPageInMobileSafari,
  useUserPageDialogOpened,
} from "~/helpers/userPages";
import { type Friend, type User } from "~/types/generated";

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
                    (!canOpenUrlInMobileSafari(browserDetection) &&
                      !isMobileSafari(browserDetection?.browser) &&
                      !install)
                  }
                  onClick={() => {
                    if (install) {
                      void install();
                    } else if (
                      browserDetection &&
                      !isMobileSafari(browserDetection)
                    ) {
                      openUserPageInstallationInstructionsModal({ user });
                    } else {
                      openUserPageInMobileSafari(user, currentFriend);
                    }
                  }}
                >
                  pin this page
                </Button>
                {browserDetection && (
                  <>
                    {isIos(browserDetection.os) &&
                      !isMobileSafari(browserDetection.browser) &&
                      !canOpenUrlInMobileSafari(browserDetection) && (
                        <Text className={classes.notSupportedText}>
                          open in Safari to continue
                        </Text>
                      )}
                    {isAndroid(browserDetection.os) && !install && (
                      <Text className={classes.notSupportedText}>
                        open in Chrome to continue
                      </Text>
                    )}
                    {isDesktop(browserDetection.device) && !install && (
                      <Text className={classes.notSupportedText}>
                        open on your phone to continue
                      </Text>
                    )}
                  </>
                )}
              </Group>
            </Stack>
          </Alert>
        )}
      </Transition>
    </Affix>
  );
};

export default UserPageInstallAlert;
