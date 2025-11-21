import ShuffleIcon from "~icons/basil/shuffle-solid";

import { type WorldProfile } from "~/types";

import WorldHomescreenPreview, {
  type WorldHomescreenPreviewProps,
} from "./WorldHomescreenPreview";

export interface WorldHomescreenPreviewWithAlternateIconProps
  extends WorldHomescreenPreviewProps {
  world: WorldProfile;
  alternativeManifestIconPageUrlQuery?: Record<string, string>;
}

const WorldHomescreenPreviewWithAlternateIcon: FC<
  WorldHomescreenPreviewWithAlternateIconProps
> = ({
  world,
  arrowLabel,
  radius,
  alternativeManifestIconPageUrlQuery,
  ...otherProps
}) => {
  // == Manifest icons
  const queryParams = useQueryParams();
  const alternatePageUrl = usePageUrlWithAlternativeManifestIcon(
    alternativeManifestIconPageUrlQuery,
  );

  return (
    <Stack gap="xs" {...otherProps}>
      <WorldHomescreenPreview
        world={queryParams.manifest_icon_type === "generic" ? null : world}
        {...{ arrowLabel, radius }}
      />
      {world && (
        <Button
          component="a"
          href={alternatePageUrl}
          size="compact-sm"
          leftSection={<Box component={ShuffleIcon} fz="lg" />}
          style={{ alignSelf: "center" }}
        >
          use{" "}
          {queryParams.manifest_icon_type === "generic"
            ? world.name
            : "smaller world"}{" "}
          icon
        </Button>
      )}
    </Stack>
  );
};

export default WorldHomescreenPreviewWithAlternateIcon;

const usePageUrlWithAlternativeManifestIcon = (
  query?: Record<string, string>,
): string | undefined => {
  const { url: pagePath } = usePage();
  const [alternateUrl, setAlternateUrl] = useState<string>();
  useEffect(() => {
    const pageUrl = hrefToUrl(pagePath);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        pageUrl.searchParams.set(key, value);
      });
    }
    const iconType = pageUrl.searchParams.get("manifest_icon_type");
    if (iconType === "generic") {
      pageUrl.searchParams.delete("manifest_icon_type");
    } else {
      pageUrl.searchParams.set("manifest_icon_type", "generic");
    }
    setAlternateUrl(pageUrl.toString());
  }, [pagePath]); // eslint-disable-line react-hooks/exhaustive-deps
  return alternateUrl;
};
