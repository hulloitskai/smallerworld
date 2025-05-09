import {
  AppShell,
  type AppShellProps,
  Breadcrumbs,
  type ContainerProps,
  Loader,
  type MantineSize,
  Overlay,
  RemoveScroll,
  Text,
} from "@mantine/core";

import {
  type DynamicProp,
  resolveDynamicProp,
  useResolveDynamicProp,
} from "~/helpers/appLayout";
import { useWaitingForServiceWorkerReady } from "~/helpers/serviceWorker";
import { useTrackVisit } from "~/helpers/visits";

import AppHeader, { type AppHeaderProps } from "./AppHeader";
import AppMeta, { type AppMetaProps } from "./AppMeta";
import PageContainer from "./PageContainer";
import PageLayout from "./PageLayout";
import UserThemeProvider from "./UserThemeProvider";

import classes from "./AppLayout.module.css";

export interface AppLayoutProps<PageProps extends SharedPageProps>
  extends Omit<
      AppMetaProps,
      "title" | "description" | "imageUrl" | "manifestUrl"
    >,
    Omit<AppShellProps, "title"> {
  title?: DynamicProp<PageProps, AppMetaProps["title"]>;
  description?: DynamicProp<PageProps, AppMetaProps["description"]>;
  breadcrumbs?: DynamicProp<PageProps, (AppBreadcrumb | null | false)[]>;
  withContainer?: boolean;
  containerSize?: MantineSize | (string & {}) | number;
  containerProps?: ContainerProps;
  withGutter?: boolean;
  gutterSize?: MantineSize | (string & {}) | number;
  logoHref?: DynamicProp<PageProps, AppHeaderProps["logoHref"]>;
  imageUrl?: DynamicProp<PageProps, AppMetaProps["imageUrl"]>;
  manifestUrl?: DynamicProp<PageProps, AppMetaProps["manifestUrl"]>;
}

export interface AppBreadcrumb {
  title: string;
  href: string;
}

const LAYOUT_WITH_BORDER = false;

const AppLayout = <PageProps extends SharedPageProps = SharedPageProps>({
  title: titleProp,
  description: descriptionProp,
  imageUrl: imageUrlProp,
  noIndex,
  breadcrumbs: breadcrumbsProp,
  withContainer,
  containerSize,
  containerProps,
  withGutter,
  gutterSize,
  logoHref: logoHrefProp,
  manifestUrl: manifestUrlProp,
  children,
  padding,
  p,
  pt,
  pb,
  pr,
  pl,
  py,
  px,
  ...otherProps
}: AppLayoutProps<PageProps>) => {
  useTrackVisit();
  const isStandalone = useIsStandalone();

  // == Meta
  const title = useResolveDynamicProp(titleProp);
  const description = useResolveDynamicProp(descriptionProp);
  const imageUrl = useResolveDynamicProp(imageUrlProp);
  const manifestUrl = useResolveDynamicProp(manifestUrlProp);

  // == Breadcrumbs
  const page = usePage<PageProps>();
  const breadcrumbs = useMemo<AppBreadcrumb[]>(() => {
    return breadcrumbsProp
      ? resolveDynamicProp(breadcrumbsProp, page).filter(x => !!x)
      : [];
  }, [breadcrumbsProp, page]);

  // == Header
  const logoHref = useResolveDynamicProp(logoHrefProp);

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

  // == Service worker
  const waitingForServiceWorkerReady = useWaitingForServiceWorkerReady();

  const shell = (
    <AppShell
      withBorder={LAYOUT_WITH_BORDER}
      {...(isStandalone === false && { header: { height: 46 } })}
      padding={padding ?? (withContainer ? undefined : "md")}
      classNames={{ root: classes.shell, header: classes.header }}
      data-vaul-drawer-wrapper
      {...otherProps}
    >
      {isStandalone === false && <AppHeader {...{ logoHref }} />}
      <AppShell.Main
        className={classes.main}
        {...{ pt, pb, pr, pl, py, px, p }}
      >
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
    </AppShell>
  );
  return (
    <PageLayout>
      <AppMeta {...{ title, description, imageUrl, noIndex, manifestUrl }} />
      <UserThemeProvider>
        <RemoveScroll enabled={waitingForServiceWorkerReady}>
          {shell}
          {waitingForServiceWorkerReady && (
            <Overlay
              className={classes.waitingForServiceWorkerReadyOverlay}
              blur={3}
              pos="fixed"
            >
              <Loader size="md" />
              <Stack gap={6} ta="center" maw={240}>
                <Text
                  className={classes.waitingForServiceWorkerReadyText}
                  size="sm"
                >
                  completing installation—this may take up to 30 seconds...
                </Text>
                <Text
                  className={classes.waitingForServiceWorkerReadySubtext}
                  size="xs"
                >
                  thank u for your patience 😭
                  <br />i appreciate u :')
                </Text>
              </Stack>
            </Overlay>
          )}
        </RemoveScroll>
      </UserThemeProvider>
    </PageLayout>
  );
};

export default AppLayout;
