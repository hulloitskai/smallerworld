import { AppShell, type AppShellHeaderProps, Image } from "@mantine/core";

import logoSrc from "~/assets/images/logo.png";

import AppMenu from "./AppMenu";

import classes from "./AppHeader.module.css";

export interface AppHeaderProps extends Omit<AppShellHeaderProps, "children"> {
  logoHref?: string;
}

const AppHeader = forwardRef<HTMLDivElement, AppHeaderProps>(
  ({ className, logoHref, ...otherProps }, ref) => {
    const isStandalone = useIsStandalone();
    return (
      <AppShell.Header
        {...{ ref }}
        px={8}
        className={cn("AppHeader", classes.header, className)}
        {...otherProps}
      >
        <Group justify="space-between" gap={8} h="100%">
          <Group gap={4}>
            <Button
              component={Link}
              href={logoHref ?? routes.start.redirect.path()}
              variant="subtle"
              size="compact-md"
              leftSection={<Image src={logoSrc} h={24} w="unset" />}
              className={classes.logoButton}
            >
              smaller world
            </Button>
          </Group>
          {!isStandalone && <AppMenu className={classes.menu} />}
        </Group>
      </AppShell.Header>
    );
  },
);

export default AppHeader;
