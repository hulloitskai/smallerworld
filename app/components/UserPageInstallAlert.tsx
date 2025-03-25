import { Affix, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import {
  useInstallPrompt,
  useIsIosSafari,
  useIsIosWebview,
} from "~/helpers/pwa";
import { useUserPageDialogOpened } from "~/helpers/userPages";
import { type User } from "~/types/generated";

import { openUserPageInstallationInstructionsModal } from "./UserPageInstallationInstructionsModal";

import classes from "./UserPageInstallAlert.module.css";

export interface UserPageInstallAlertProps {
  user: User;
}

const ALERT_INSET = "var(--mantine-spacing-md)";

const UserPageInstallAlert: FC<UserPageInstallAlertProps> = ({ user }) => {
  const { modals } = useModals();
  const pageDialogOpened = useUserPageDialogOpened();

  // == Install to home screen
  const { install, installing } = useInstallPrompt();
  const isIosSafari = useIsIosSafari();
  const isIosWebview = useIsIosWebview();

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
                  disabled={!install && !isIosSafari}
                  onClick={() => {
                    if (install) {
                      void install();
                    } else {
                      openUserPageInstallationInstructionsModal({ user });
                    }
                  }}
                >
                  pin this page
                </Button>
                {!install &&
                  isIosSafari === false &&
                  isIosWebview === false && (
                    <Text
                      size="xs"
                      opacity={0.6}
                      lh={1.2}
                      miw={0}
                      style={{ flexGrow: 1 }}
                    >
                      {isIosWebview ? (
                        "open in safari to continue"
                      ) : (
                        <>
                          sorry, your browser isn&apos;t supported
                          <Text span inherit visibleFrom="xs">
                            —pls open on your phone!
                          </Text>
                        </>
                      )}
                    </Text>
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
