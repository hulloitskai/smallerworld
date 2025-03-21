import {
  AppShell,
  type AppShellProps,
  Breadcrumbs,
  type ContainerProps,
  type MantineSize,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import {
  type DynamicProp,
  resolveDynamicProp,
  useResolveDynamicProp,
} from "~/helpers/layout";
import { useClearAppBadge, useIsStandalone } from "~/helpers/pwa";
import { type SidebarControls } from "~/helpers/sidebar";

import AppHeader, { type AppHeaderProps } from "./AppHeader";
import AppMeta, { type AppMetaProps } from "./AppMeta";
import PageContainer from "./PageContainer";
import PageLayout from "./PageLayout";
import { SidebarControlsProvider } from "./SidebarControlsProvider";

import classes from "./AppLayout.module.css";

export interface AppLayoutProps<PageProps extends SharedPageProps>
  extends Omit<AppMetaProps, "title" | "description" | "manifestUrl" | "icons">,
    Omit<AppShellProps, "title"> {
  title?: DynamicProp<PageProps, AppMetaProps["title"]>;
  description?: DynamicProp<PageProps, AppMetaProps["description"]>;
  icons?: DynamicProp<PageProps, AppMetaProps["icons"]>;
  manifestUrl?: DynamicProp<PageProps, AppMetaProps["manifestUrl"]>;
  breadcrumbs?: DynamicProp<PageProps, (AppBreadcrumb | null | false)[]>;
  withContainer?: boolean;
  containerSize?: MantineSize | (string & {}) | number;
  containerProps?: ContainerProps;
  withGutter?: boolean;
  gutterSize?: MantineSize | (string & {}) | number;
  sidebar?: DynamicProp<PageProps, ReactNode>;
  logoHref?: DynamicProp<PageProps, AppHeaderProps["logoHref"]>;
}

export interface AppBreadcrumb {
  title: string;
  href: string;
}

const LAYOUT_WITH_BORDER = false;

const AppLayout = <PageProps extends SharedPageProps = SharedPageProps>({
  title: titleProp,
  description: descriptionProp,
  icons: iconsProp,
  manifestUrl: manifestUrlProp,
  imageUrl,
  noIndex,
  breadcrumbs: breadcrumbsProp,
  withContainer,
  containerSize,
  containerProps,
  withGutter,
  gutterSize,
  sidebar: sidebarProp,
  logoHref: logoHrefProp,
  children,
  padding,
  ...otherProps
}: AppLayoutProps<PageProps>) => {
  useClearAppBadge();
  const pageProps = usePageProps<PageProps>();
  const isStandalone = useIsStandalone();

  // == Meta
  const title = useResolveDynamicProp(titleProp, pageProps);
  const description = useResolveDynamicProp(descriptionProp, pageProps);
  const manifestUrl = useResolveDynamicProp(manifestUrlProp, pageProps);
  const icons = useResolveDynamicProp(iconsProp, pageProps);

  // == Breadcrumbs
  const breadcrumbs = useMemo<AppBreadcrumb[]>(() => {
    return breadcrumbsProp
      ? resolveDynamicProp(breadcrumbsProp, pageProps).filter(x => !!x)
      : [];
  }, [breadcrumbsProp, pageProps]);

  // == Header
  const logoHref = useResolveDynamicProp(logoHrefProp, pageProps);

  // == Sidebar
  const sidebar = useResolveDynamicProp(sidebarProp, pageProps);
  const [
    sidebarOpened,
    { toggle: toggleSidebar, close: closeSidebar, open: openSidebar },
  ] = useDisclosure();
  const sidebarControls = useMemo<SidebarControls | null>(() => {
    return sidebar
      ? {
          opened: sidebarOpened,
          toggle: toggleSidebar,
          close: closeSidebar,
          open: openSidebar,
        }
      : null;
  }, [sidebar, sidebarOpened, toggleSidebar, closeSidebar, openSidebar]);

  // == Content
  const { style: containerStyle, ...otherContainerProps } =
    containerProps ?? {};
  const content = withContainer ? (
    <PageContainer
      size={containerSize ?? containerProps?.size}
      {...{ withGutter, gutterSize }}
      style={[
        { flexGrow: 1, display: "flex", flexDirection: "column" },
        containerStyle,
      ]}
      {...otherContainerProps}
    >
      {children}
    </PageContainer>
  ) : (
    children
  );

  return (
    <PageLayout>
      <AppMeta
        {...{ title, description, manifestUrl, imageUrl, noIndex, icons }}
      />
      <SidebarControlsProvider controls={sidebarControls}>
        <AppShell
          withBorder={LAYOUT_WITH_BORDER}
          header={{ height: isStandalone === false ? 46 : 16 }}
          {...(sidebar && {
            navbar: {
              width: 240,
              breakpoint: "sm",
              collapsed: { mobile: !sidebarOpened },
            },
          })}
          padding={padding ?? (withContainer ? undefined : "md")}
          classNames={{
            root: classes.shell,
            header: classes.header,
            navbar: classes.navbar,
          }}
          {...otherProps}
        >
          {isStandalone === false && <AppHeader {...{ logoHref }} />}
          {sidebar}
          <AppShell.Main className={classes.main}>
            {!isEmpty(breadcrumbs) && (
              <Breadcrumbs
                mx={10}
                mt={6}
                classNames={{
                  separator: classes.breadcrumbSeparator,
                }}
                styles={{
                  root: {
                    flexWrap: "wrap",
                    rowGap: rem(4),
                  },
                  separator: {
                    marginLeft: 6,
                    marginRight: 6,
                  },
                }}
              >
                {breadcrumbs.map(({ title, href }, index) => (
                  <Anchor component={Link} href={href} key={index} size="sm">
                    {title}
                  </Anchor>
                ))}
              </Breadcrumbs>
            )}
            {content}
          </AppShell.Main>
          <footer style={{ height: "var(--safe-area-inset-bottom, 0px)" }} />
          {/* <Center
            component="footer"
            className={classes.footer}
            mod={{ "with-border": LAYOUT_WITH_BORDER }}
          >
            <Attribution />
          </Center> */}
        </AppShell>
      </SidebarControlsProvider>
    </PageLayout>
  );
};

export default AppLayout;
