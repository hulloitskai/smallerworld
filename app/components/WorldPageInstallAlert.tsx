import { Affix, type AlertProps, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import { openWorldPageInstallModal } from "~/helpers/install";
import {
  useWorldPageDialogOpened,
  type WorldPageProps,
} from "~/helpers/worlds";

import classes from "./WorldPageInstallAlert.module.css";

export interface WorldPageInstallAlertProps
  extends Omit<AlertProps, "children"> {}

const WorldPageInstallAlert: FC<WorldPageInstallAlertProps> = ({
  className,
  style,
  ...otherProps
}) => {
  const { world } = usePageProps<WorldPageProps>();
  const { modals } = useModals();
  const pageDialogOpened = useWorldPageDialogOpened();

  return (
    <Affix
      className={cn("WorldPageInstallAlert", classes.affix)}
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
            title="install me on your phone!"
            className={cn(classes.alert, className)}
            style={[style, transitionStyle]}
            {...otherProps}
          >
            <Stack gap={8} align="start">
              <Text inherit>
                get notified about my thoughts, ideas, and invitations to events
                i&apos;m going to.
              </Text>
              <Group gap="xs">
                <Button
                  className={classes.button}
                  variant="white"
                  size="compact-sm"
                  leftSection={<InstallIcon />}
                  onClick={() => {
                    openWorldPageInstallModal(world);
                  }}
                >
                  install {world.name}
                </Button>
              </Group>
            </Stack>
          </Alert>
        )}
      </Transition>
    </Affix>
  );
};

export default WorldPageInstallAlert;
