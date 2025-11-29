import { Affix, type AlertProps, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import { openAppInstallModal } from "~/helpers/install";
import { usePageDialogOpened } from "~/helpers/pageDialog";

import classes from "./AppInstallAlert.module.css";

export interface AppInstallAlertProps extends AlertProps {}

const AppInstallAlert: FC<AppInstallAlertProps> = ({
  children,
  className,
  style,
  ...otherProps
}) => {
  const { modals } = useModals();
  const pageDialogOpened = usePageDialogOpened();
  return (
    <Affix
      className={cn("AppInstallAlert", classes.affix)}
      position={{}}
      zIndex={180}
    >
      <Transition
        transition="pop"
        mounted={isEmpty(modals) && !pageDialogOpened}
        enterDelay={100}
      >
        {transitionStyle => (
          <Alert
            variant="filled"
            icon={<NotificationIcon />}
            title="add smaller world to your phone"
            className={cn(classes.alert, className)}
            style={[style, transitionStyle]}
            {...otherProps}
          >
            <Stack gap={8} align="start">
              <Text inherit>{children}</Text>
              <Group gap="xs">
                <Button
                  className={classes.button}
                  variant="white"
                  size="compact-sm"
                  leftSection={<InstallIcon />}
                  onClick={() => {
                    openAppInstallModal();
                  }}
                >
                  install smaller world
                </Button>
              </Group>
            </Stack>
          </Alert>
        )}
      </Transition>
    </Affix>
  );
};

export default AppInstallAlert;
