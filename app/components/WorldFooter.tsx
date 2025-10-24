import { type InertiaLinkProps } from "@inertiajs/react";
import {
  AppShell,
  type AppShellFooterProps,
  type BadgeProps,
  Image,
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
        <LinkItemBadge
          href={withTrailingSlash(routes.world.show.path())}
          leftSection={<Image src={logoSrc} h={18} w="unset" />}
          active={!isLocalUniverse}
        >
          your world
        </LinkItemBadge>
        <LinkItemBadge
          href={routes.localUniverse.show.path()}
          leftSection="💫"
          active={isLocalUniverse}
        >
          local universe
        </LinkItemBadge>
      </AppShell.Footer>
    );
  },
);

export default WorldFooter;

interface LinkItemProps
  extends Omit<BadgeProps, "variant">,
    Omit<InertiaLinkProps, "color" | "size" | "onChange" | "style"> {
  active: boolean;
}
const LinkItemBadge: FC<LinkItemProps> = ({
  className,
  active,
  ...otherProps
}) => (
  <Badge
    className={cn(classes.linkItem, className)}
    component={Link}
    variant={active ? "filled" : "outline"}
    size="lg"
    mod={{ active }}
    {...otherProps}
  />
);
