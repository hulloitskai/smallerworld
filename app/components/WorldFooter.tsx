import {
  AppShell,
  type AppShellFooterProps,
  Image,
  SegmentedControl,
} from "@mantine/core";

import logoSrc from "~/assets/images/logo.png";

import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { type LocalUniversePageProps } from "~/pages/LocalUniversePage";
import { type WorldPageProps } from "~/pages/WorldPage";

import classes from "./WorldFooter.module.css";

export interface WorldFooterProps
  extends Omit<AppShellFooterProps, "children"> {}

const WORLD_ICON_SIZE = 18;

const WorldFooter = forwardRef<HTMLDivElement, WorldFooterProps>(
  ({ className, ...otherProps }, ref) => {
    const {
      url,
      props: { currentUser },
    } = usePage<WorldPageProps | LocalUniversePageProps>();
    const [value, setValue] = useState<"world" | "universe">(() =>
      urlValue(url),
    );
    useDidUpdate(() => {
      setValue(urlValue(url));
    }, [url]);
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
                  icon={
                    <Image
                      src={currentUser.page_icon.src}
                      srcSet={currentUser.page_icon.srcset ?? undefined}
                      h={WORLD_ICON_SIZE}
                      w="unset"
                      radius={WORLD_ICON_SIZE / USER_ICON_RADIUS_RATIO}
                    />
                  }
                />
              ),
            },
            {
              value: "universe",
              label: (
                <NavItem
                  text="your universe"
                  icon={<Image src={logoSrc} h={18} w="unset" />}
                />
              ),
            },
          ]}
          {...{ value }}
          onChange={value => {
            switch (value) {
              case "world":
                setValue(value);
                startTransition(() => {
                  router.visit(withTrailingSlash(routes.world.show.path()));
                });
                break;
              case "universe":
                setValue(value);
                startTransition(() => {
                  router.visit(routes.localUniverse.show.path());
                });
                break;
            }
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

const urlValue = (url: string): "world" | "universe" =>
  url.startsWith(routes.localUniverse.show.path()) ? "universe" : "world";
