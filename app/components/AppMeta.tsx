import bricolageGrotesqueSrc from "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url";
import manropeWoff2Src from "@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url";
import { dirname } from "@sentry/core";

import { useIsHotwireNative } from "~/helpers/hotwire";

const APP_META_SITE_NAME = "smaller world";
const APP_META_SITE_DESCRIPTION = "a smaller world for you and your friends :)";
const APP_META_SITE_IMAGE = "/banner.png";
const APP_META_TITLE_SEPARATOR = "|";

export interface AppMetaProps {
  siteName?: string;
  title?: string | string[];
  description?: string | null;
  imageUrl?: string | null;
  noIndex?: boolean;
  manifestUrl?: string | null;
  pwaScope?: string | null;
}

const AppMeta: FC<AppMetaProps> = ({
  description = APP_META_SITE_DESCRIPTION,
  imageUrl = APP_META_SITE_IMAGE,
  noIndex,
  siteName = APP_META_SITE_NAME,
  title: titleProp,
  manifestUrl,
  pwaScope = manifestUrl ? dirname(manifestUrl) : undefined,
}) => {
  const isNative = useIsHotwireNative();

  const pageTitle = useMemo<string>(() => {
    const components = Array.isArray(titleProp) ? titleProp : [titleProp];
    return components
      .reverse()
      .filter(component => !!component)
      .join(` ${APP_META_TITLE_SEPARATOR} `);
  }, [titleProp]);
  const siteTitle = useMemo<string>(
    () =>
      [pageTitle, siteName]
        .filter(component => !!component)
        .join(` ${APP_META_TITLE_SEPARATOR} `),
    [pageTitle, siteName],
  );
  const tabTitle = useMemo<string>(() => {
    const components = [pageTitle];
    if (!isNative) {
      components.push(siteName);
    }
    return components
      .filter(component => !!component)
      .join(` ${APP_META_TITLE_SEPARATOR} `);
  }, [pageTitle, siteName, isNative]);

  return (
    <Head>
      <title head-key="title">{tabTitle}</title>
      {!!description && (
        <meta head-key="description" name="description" content={description} />
      )}
      {!!manifestUrl && (
        <link
          head-key="manifest"
          rel="manifest"
          href={manifestUrl}
          crossOrigin="use-credentials"
        />
      )}
      {!!pwaScope && (
        <meta head-key="pwa-scope" name="pwa-scope" content={pwaScope} />
      )}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content="website" />
      {!!pageTitle && <meta property="og:title" content={pageTitle} />}
      {!!description && (
        <meta property="og:description" content={description} />
      )}
      {!!imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={siteTitle} />
      {!!description && (
        <meta name="twitter:description" content={description} />
      )}
      {!!imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {noIndex && <meta name="robots" content="noindex" />}
      <link
        rel="preload"
        as="font"
        type="font/woff2"
        href={manropeWoff2Src}
        crossOrigin="anonymous"
      />
      <link
        as="font"
        type="font/woff2"
        href={bricolageGrotesqueSrc}
        crossOrigin="anonymous"
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Single+Day&display=swap"
        rel="stylesheet"
      />
    </Head>
  );
};

export default AppMeta;
