import { Affix, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import {
  canOpenUrlInMobileSafari,
  isDesktop,
  isMobileStandaloneBrowser,
  shouldWaitForInstallEvent,
  useBrowserDetection,
} from "~/helpers/browsers";
import { openUniverseInstallationInstructionsInMobileSafari } from "~/helpers/universe";

import BrowserNotSupportedText from "./BrowserNotSupportedText";
import { openInstallationInstructionsModal } from "./InstallationInstructionsModal";

import classes from "./UniversePageInstallAlert.module.css";

export interface UniversePageInstallAlertProps {}

const UniversePageInstallAlert: FC<UniversePageInstallAlertProps> = () => {
  const { modals } = useModals();

  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == Install to home screen
  const { install, installing } = usePWA();

  return (
    <Affix className={classes.affix} position={{}} zIndex={180}>
      <Transition transition="pop" mounted={isEmpty(modals)} enterDelay={100}>
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
                stay connected to smaller world happenings—thoughts, ideas, and
                invitations to events you&apos;re going to.
              </Text>
              <Group gap="xs">
                <Button<"a" | "button">
                  className={classes.button}
                  variant="white"
                  size="compact-sm"
                  leftSection={<InstallIcon />}
                  loading={
                    installing ||
                    (browserDetection &&
                      shouldWaitForInstallEvent(browserDetection) &&
                      !install)
                  }
                  disabled={!browserDetection}
                  onClick={() => {
                    invariant(browserDetection, "Missing browser detection");
                    if (install && !isDesktop(browserDetection)) {
                      void install();
                    } else if (
                      !isMobileStandaloneBrowser(browserDetection) &&
                      canOpenUrlInMobileSafari(browserDetection)
                    ) {
                      openUniverseInstallationInstructionsInMobileSafari();
                    } else {
                      openInstallationInstructionsModal({
                        title: "install smaller universe 📲",
                        pageName: "smaller universe",
                        pageIcon: null,
                      });
                    }
                  }}
                >
                  {install &&
                  browserDetection &&
                  !isDesktop(browserDetection) ? (
                    <>install smaller universe</>
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

export default UniversePageInstallAlert;
