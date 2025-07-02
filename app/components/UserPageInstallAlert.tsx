import { Affix, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import {
  canOpenUrlInMobileSafari,
  isDesktop,
  isMobileStandaloneBrowser,
  useBrowserDetection,
} from "~/helpers/browsers";
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
  const { install, installing } = usePWA();

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
            title="install me on your phone!"
            className={classes.alert}
            {...{ style }}
          >
            <Stack gap={8} align="start">
              <Text inherit>
                get notified about my thoughts, ideas, and invitations to events
                i&apos;m going to.
              </Text>
              <Group gap="xs">
                <Button<"a" | "button">
                  className={classes.button}
                  variant="white"
                  size="compact-sm"
                  leftSection={<InstallIcon />}
                  loading={installing}
                  disabled={!browserDetection}
                  onClick={() => {
                    invariant(browserDetection, "Missing browser detection");
                    if (install && !isDesktop(browserDetection)) {
                      void install();
                    } else if (
                      !isMobileStandaloneBrowser(browserDetection) &&
                      canOpenUrlInMobileSafari(browserDetection)
                    ) {
                      openUserPageInstallationInstructionsInMobileSafari(
                        user,
                        currentFriend,
                      );
                    } else {
                      openUserPageInstallationInstructionsModal({
                        user,
                      });
                    }
                  }}
                >
                  {install &&
                  browserDetection &&
                  !isDesktop(browserDetection) ? (
                    <>install {possessive(user.name)} world</>
                  ) : (
                    <>let&apos;s do it</>
                  )}
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
