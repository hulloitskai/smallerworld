import { Affix, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import {
  canOpenUrlInMobileSafari,
  isMobileStandaloneBrowser,
  useBrowserDetection,
} from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa/install";
import {
  openUserPageInstallationInstructionsInMobileSafari,
  useUserPageDialogOpened,
} from "~/helpers/userPages";
import { type UserPageProps } from "~/pages/UserPage";
import { type Friend } from "~/types/generated";

import BrowserNotSupportedText from "./BrowserNotSupportedText";
import { openUserPageInstallationInstructionsModal } from "./UserPageInstallationInstructionsModal";

import classes from "./UserPageInstallAlert.module.css";

export interface UserPageInstallAlertProps {
  currentFriend: Friend;
}

const UserPageInstallAlert: FC<UserPageInstallAlertProps> = ({
  currentFriend,
}) => {
  const { user } = usePageProps<UserPageProps>();
  const { modals } = useModals();
  const pageDialogOpened = useUserPageDialogOpened();

  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == Install to home screen
  const { install, installing } = useInstallPrompt();

  return (
    <Affix className={classes.affix} position={{}} zIndex={180}>
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
