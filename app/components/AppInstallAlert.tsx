import { type AlertProps, Text } from "@mantine/core";

import { openAppInstallModal } from "~/helpers/install";

import classes from "./AppInstallAlert.module.css";

export interface AppInstallAlertProps extends AlertProps {}

const AppInstallAlert: FC<AppInstallAlertProps> = ({
  children,
  className,
  ...otherProps
}) => (
  <Alert
    variant="filled"
    icon={<NotificationIcon />}
    title="add smaller world to your phone"
    className={cn(classes.alert, className)}
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
);

export default AppInstallAlert;
