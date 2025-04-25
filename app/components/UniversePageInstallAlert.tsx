import { Affix, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import {
  canOpenUrlInMobileSafari,
  isMobileStandaloneBrowser,
  useBrowserDetection,
} from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa/install";
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
  const { install, installing } = useInstallPrompt();

  return (
    <Affix className={classes.affix} position={{}} zIndex={180}>
      <Transition transition="pop" mounted={isEmpty(modals)} enterDelay={100}>
        {style => (
          <Alert
            variant="filled"
            icon={<NotificationIcon />}
            title="stay connected to smaller world happenings :)"
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
                      openInstallationInstructionsModal({
                        title: (
                          <>
                            add the smaller universe to your
                            home&nbsp;screen&nbsp;:)
                          </>
                        ),
                        pageName: "smaller universe",
                        pageIcon: null,
                      });
                    } else {
                      openUniverseInstallationInstructionsInMobileSafari();
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

export default UniversePageInstallAlert;
