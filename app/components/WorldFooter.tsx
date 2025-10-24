import { type InertiaLinkProps } from "@inertiajs/react";
import {
  AppShell,
  type AppShellFooterProps,
  Image,
  NavLink,
  type NavLinkProps,
} from "@mantine/core";

import logoSrc from "~/assets/images/logo.png";

import classes from "./WorldFooter.module.css";

export interface WorldFooterProps
  extends Omit<AppShellFooterProps, "children"> {}

const WorldFooter = forwardRef<HTMLDivElement, WorldFooterProps>(
  ({ className, ...otherProps }, ref) => {
    const { url } = usePage();
    const isLocalUniverse = url.startsWith(routes.localUniverse.show.path());
    return (
      <AppShell.Footer
        {...{ ref }}
        px={8}
        className={cn("AppFooter", classes.footer, className)}
        {...otherProps}
      >
        <NavLinkItem
          href={withTrailingSlash(routes.world.show.path())}
          label="your world"
          leftSection={<Image src={logoSrc} h={18} />}
          active={!isLocalUniverse}
        />
        <NavLinkItem
          href={routes.localUniverse.show.path()}
          label="local universe"
          leftSection="💫"
          active={isLocalUniverse}
          className={classes.localUniverseNavLink}
        />
      </AppShell.Footer>
    );
  },
);

export default WorldFooter;

interface NavLinkItemProps
  extends NavLinkProps,
    Omit<InertiaLinkProps, "color" | "label" | "onChange" | "style"> {}
const NavLinkItem: FC<NavLinkItemProps> = ({ className, ...otherProps }) => (
  <NavLink
    className={cn(classes.navLink, className)}
    component={Link}
    {...otherProps}
  />
);
