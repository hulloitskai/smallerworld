import {
  AppShell,
  type AppShellFooterProps,
  Image,
  SegmentedControl,
} from "@mantine/core";

import logoSrc from "~/assets/images/logo.png";

import classes from "./WorldFooter.module.css";

export interface WorldFooterProps
  extends Omit<AppShellFooterProps, "children"> {}

const WorldFooter = forwardRef<HTMLDivElement, WorldFooterProps>(
  ({ className, ...otherProps }, ref) => {
    const { url } = usePage();
    const value = useMemo(
      () =>
        url.startsWith(routes.localUniverse.show.path()) ? "universe" : "world",
      [url],
    );
    return (
      <AppShell.Footer
        {...{ ref }}
        px={8}
        className={cn("AppFooter", classes.footer, className)}
        {...otherProps}
      >
        <SegmentedControl
          data={[
            {
              value: "world",
              label: (
                <NavItem
                  text="your world"
                  icon={<Image src={logoSrc} h={18} w="unset" />}
                />
              ),
            },
            {
              value: "universe",
              label: (
                <NavItem
                  text="your universe"
                  icon={
                    <span style={{ fontFamily: "var(--font-family-emoji)" }}>
                      💫
                    </span>
                  }
                />
              ),
            },
          ]}
          {...{ value }}
          onChange={value => {
            router.visit(
              value === "world"
                ? withTrailingSlash(routes.world.show.path())
                : routes.localUniverse.show.path(),
            );
          }}
          className={classes.segmentedControl}
        />
      </AppShell.Footer>
    );
  },
);

export default WorldFooter;

interface NavItemLabel {
  text: string;
  icon: ReactNode;
}

const NavItem: FC<NavItemLabel> = ({ text, icon }) => (
  <Group gap={6}>
    {icon}
    {text}
  </Group>
);
