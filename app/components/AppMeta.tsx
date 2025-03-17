import { useDocumentVisibility } from "@mantine/hooks";

import { useIsStandalone } from "~/helpers/pwa";

const APP_META_SITE_TYPE = "website";
const APP_META_SITE_NAME = "smaller world";
const APP_META_SITE_DESCRIPTION = "a smaller world for you and your friends :)";
const APP_META_SITE_IMAGE = "/banner.png";
const APP_META_TITLE_SEPARATOR = "|";

export interface AppMetaProps {
  siteName?: string;
  title?: string | string[];
  description?: string | null;
  imageUrl?: string | null;
  manifestUrl?: string | null;
  noIndex?: boolean;
}

const AppMeta: FC<AppMetaProps> = ({
  description = APP_META_SITE_DESCRIPTION,
  imageUrl = APP_META_SITE_IMAGE,
  manifestUrl = "/site.webmanifest",
  noIndex,
  siteName = APP_META_SITE_NAME,
  title: titleProp,
}) => {
  const isStandalone = useIsStandalone();
  const pageVisibility = useDocumentVisibility();
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
    let title = pageTitle;
    if (
      pageVisibility === "hidden" &&
      !title &&
      siteName === APP_META_SITE_NAME
    ) {
      title = "🥺 come back";
    }
    if (isStandalone) {
      return title;
    }
    return [title, siteName]
      .filter(component => !!component)
      .join(` ${APP_META_TITLE_SEPARATOR} `);
  }, [pageTitle, pageVisibility, siteName, isStandalone]);

  return (
    <Head>
      <title>{tabTitle}</title>
      {!!manifestUrl && <link rel="manifest" href={manifestUrl} />}
      {!!description && <meta name="description" content={description} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={APP_META_SITE_TYPE} />
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
    </Head>
  );
};

export default AppMeta;
