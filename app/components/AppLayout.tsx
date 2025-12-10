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
import { useIsHotwireNative } from "~/helpers/hotwire";
import { useAutoClearColorScheme } from "~/helpers/mantine";
import { CONFETTI_CANVAS_ID, SMOKE_CANVAS_ID } from "~/helpers/particles";
import { useTrackVisit } from "~/helpers/visits";
import { useReregisterPushSubscriptionIfNeeded } from "~/helpers/webPush";

import AppHeader, { type AppHeaderProps } from "./AppHeader";
import AppMeta, { type AppMetaProps } from "./AppMeta";
import PageContainer from "./PageContainer";
import PageDialogStateProvider from "./PageDialogStateProvider";
import PageLayout from "./PageLayout";
import WorldThemeProvider from "./WorldThemeProvider";

import classes from "./AppLayout.module.css";

export interface AppLayoutProps<PageProps extends SharedPageProps>
  extends Omit<
      AppMetaProps,
      "title" | "description" | "imageUrl" | "manifestUrl" | "pwaScope"
    >,
    Omit<AppInnerProps, "breadcrumbs" | "logoHref" | "footer"> {
  title?: DynamicProp<PageProps, AppMetaProps["title"]>;
  description?: DynamicProp<PageProps, AppMetaProps["description"]>;
  breadcrumbs?: DynamicProp<PageProps, (AppBreadcrumb | null | false)[]>;
  footer?: DynamicProp<PageProps, ReactNode>;
  withContainer?: boolean;
  containerSize?: MantineSize | (string & {}) | number;
  containerProps?: ContainerProps;
  withGutter?: boolean;
  gutterSize?: MantineSize | (string & {}) | number;
  logoHref?: DynamicProp<PageProps, AppHeaderProps["logoHref"]>;
  imageUrl?: DynamicProp<PageProps, AppMetaProps["imageUrl"]>;
  manifestUrl?: DynamicProp<PageProps, AppMetaProps["manifestUrl"]>;
  pwaScope?: DynamicProp<PageProps, AppMetaProps["pwaScope"]>;
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
  footer: footerProp,
  logoHref: logoHrefProp,
  manifestUrl: manifestUrlProp,
  pwaScope: pwaScopeProp,
  hideTitleOnNative,
  ...appShellProps
}: AppLayoutProps<PageProps>) => {
  // == Meta
  const title = useResolveDynamicProp(titleProp);
  const description = useResolveDynamicProp(descriptionProp);
  const imageUrl = useResolveDynamicProp(imageUrlProp);
  const manifestUrl = useResolveDynamicProp(manifestUrlProp);
  const pwaScope = useResolveDynamicProp(pwaScopeProp);

  // == Breadcrumbs
  const page = usePage<PageProps>();
  const breadcrumbs = useMemo<AppBreadcrumb[]>(() => {
    return breadcrumbsProp
      ? resolveDynamicProp(breadcrumbsProp, page).filter(x => !!x)
      : [];
  }, [breadcrumbsProp, page]);

  // == Header, Footer
  const logoHref = useResolveDynamicProp(logoHrefProp);
  const footer = useResolveDynamicProp(footerProp);

  return (
    <>
      <AppMeta
        {...{
          title,
          description,
          imageUrl,
          noIndex,
          manifestUrl,
          pwaScope,
          hideTitleOnNative,
        }}
      />
      <PageLayout>
        <PageDialogStateProvider>
          <WorldThemeProvider>
            <PWALoadingRemoveScroll>
              <AppInner
                {...{ breadcrumbs, logoHref, footer }}
                {...appShellProps}
              />
              <PWALoadingOverlay />
            </PWALoadingRemoveScroll>
          </WorldThemeProvider>
        </PageDialogStateProvider>
      </PageLayout>
    </>
  );
};

export default AppLayout;

interface AppInnerProps
  extends Omit<AppShellProps, "title" | "header" | "footer"> {
  breadcrumbs: AppBreadcrumb[];
  withContainer?: boolean;
  containerSize?: MantineSize | (string & {}) | number;
  containerProps?: ContainerProps;
  withGutter?: boolean;
  gutterSize?: MantineSize | (string & {}) | number;
  logoHref?: AppHeaderProps["logoHref"];
  footer?: ReactNode;
}

const AppInner: FC<AppInnerProps> = ({
  children,
  breadcrumbs,
  withContainer,
  containerSize,
  containerProps,
  withGutter,
  gutterSize,
  logoHref,
  footer,
  padding,
  pt,
  pb,
  pr,
  pl,
  py,
  px,
  p,
  ...otherProps
}) => {
  const { isStandalone, outOfPWAScope } = usePWA();
  const isNative = useIsHotwireNative();

  // == Track visit and reregister push subscriptions
  useTrackVisit();
  useAutoClearColorScheme(); // TODO: Remove after May 29, 2025
  useReregisterPushSubscriptionIfNeeded();

  // == Container and main
  const { style: containerStyle, ...otherContainerProps } =
    containerProps ?? {};
  const main = withContainer ? (
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
    <>
      <AppShell
        withBorder={LAYOUT_WITH_BORDER}
        {...(isNative === false &&
          (isStandalone === false || outOfPWAScope) && {
            header: { height: 46 },
          })}
        {...(footer && { footer: { height: 40 } })}
        padding={padding ?? (withContainer ? undefined : "md")}
        classNames={{ root: classes.shell, header: classes.header }}
        data-vaul-drawer-wrapper
        {...otherProps}
      >
        {isNative === false && (isStandalone === false || outOfPWAScope) && (
          <AppHeader {...{ logoHref }} />
        )}
        <AppShell.Main
          className={classes.main}
          {...{ pt, pb, pr, pl, py, px, p }}
        >
          {!isEmpty(breadcrumbs) && (
            <Breadcrumbs
              mx={10}
              mt={6}
              classNames={{
                root: classes.breadcrumb,
                separator: classes.breadcrumbSeparator,
              }}
            >
              {breadcrumbs.map(({ title, href }, index) => (
                <Anchor component={Link} href={href} key={index} size="sm">
                  {title}
                </Anchor>
              ))}
            </Breadcrumbs>
          )}
          {main}
        </AppShell.Main>
        {isNative === false && footer}
      </AppShell>
      <canvas id={SMOKE_CANVAS_ID} className={classes.particleCanvas} />
      <canvas id={CONFETTI_CANVAS_ID} className={classes.particleCanvas} />
    </>
  );
};

interface PWALoadingRemoveScrollProps extends PropsWithChildren {}

const PWALoadingRemoveScroll: FC<PWALoadingRemoveScrollProps> = ({
  children,
}) => {
  const { isStandalone, activeServiceWorker } = usePWA();
  return (
    <RemoveScroll enabled={isStandalone && activeServiceWorker === undefined}>
      {children}
    </RemoveScroll>
  );
};

const PWALoadingOverlay: FC = () => {
  const { isStandalone, activeServiceWorker } = usePWA();
  return (
    <>
      {isStandalone && activeServiceWorker === undefined && (
        <Overlay
          className={classes.pwaLoadingOverlay}
          blur={3}
          center
          pos="fixed"
        >
          <Loader size="md" />
          <Stack gap={6} ta="center" maw={240}>
            <Text className={classes.pwaLoadingOverlayText} size="sm">
              completing installation—this may take up to 30 seconds...
            </Text>
            <Text className={classes.pwaLoadingOverlaySubtext} size="xs">
              thank u for your patience 😭
              <br />i appreciate u :')
            </Text>
          </Stack>
        </Overlay>
      )}
    </>
  );
};
