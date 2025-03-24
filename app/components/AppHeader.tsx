import { AppShell, type AppShellHeaderProps, Burger } from "@mantine/core";

// import { Image } from "@mantine/core";
// import logoSrc from "~/assets/images/logo-circle.png";
import { useSidebarControls } from "~/helpers/sidebar";

import AppMenu from "./AppMenu";

import classes from "./AppHeader.module.css";

export interface AppHeaderProps extends Omit<AppShellHeaderProps, "children"> {
  logoHref?: string;
}

const AppHeader = forwardRef<HTMLDivElement, AppHeaderProps>(
  ({ className, logoHref, ...otherProps }, ref) => {
    const isStandalone = useIsStandalone();
    const sidebarControls = useSidebarControls();
    return (
      <AppShell.Header
        {...{ ref }}
        px={8}
        className={cn("AppHeader", classes.header, className)}
        {...otherProps}
      >
        <Group justify="space-between" gap={8} h="100%">
          <Group gap={4}>
            {sidebarControls && (
              <Burger
                className={classes.clickable}
                opened={sidebarControls.opened}
                onClick={sidebarControls.toggle}
                hiddenFrom="sm"
                size="sm"
              />
            )}
            <Button
              component={Link}
              href={logoHref ?? routes.start.show.path()}
              variant="subtle"
              size="compact-md"
              leftSection={<SmallerWorldIcon />}
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
