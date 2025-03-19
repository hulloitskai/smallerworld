import { Affix, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import {
  useInstallPromptEvent,
  useIsInstallable,
  useIsStandalone,
} from "~/helpers/pwa";
import { type User } from "~/types/generated";

import { openUserPageInstallationInstructionsModal } from "./UserPageInstallationInstructionsModal";

import classes from "./UserPageInstallAlert.module.css";

export interface UserPageInstallAlertProps {
  user: User;
}

const ALERT_INSET = "var(--mantine-spacing-md)";

const UserPageInstallAlert: FC<UserPageInstallAlertProps> = ({ user }) => {
  const isStandalone = useIsStandalone();
  const installPromptEvent = useInstallPromptEvent();
  const isInstallable = useIsInstallable(installPromptEvent);
  const { modals } = useModals();
  return (
    <Affix
      position={{
        bottom: `calc(${ALERT_INSET} + env(safe-area-inset-bottom, 0px))`,
        left: ALERT_INSET,
        right: ALERT_INSET,
      }}
    >
      <Transition
        transition="pop"
        mounted={isEmpty(modals) && isStandalone === false}
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
                <Button
                  variant="white"
                  size="compact-sm"
                  leftSection={<InstallIcon />}
                  className={classes.button}
                  disabled={isInstallable === false}
                  onClick={() => {
                    if (installPromptEvent) {
                      void installPromptEvent.prompt();
                    } else {
                      openUserPageInstallationInstructionsModal({ user });
                    }
                  }}
                >
                  pin this page
                </Button>
                {isInstallable === false && (
                  <Text
                    size="xs"
                    opacity={0.6}
                    lh={1.2}
                    miw={0}
                    style={{ flexGrow: 1 }}
                  >
                    sorry, your browser isn&apos;t supported
                    <Text span inherit visibleFrom="xs">
                      —pls open on your phone!
                    </Text>
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
