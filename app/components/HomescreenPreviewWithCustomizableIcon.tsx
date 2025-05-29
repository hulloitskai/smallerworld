import ShuffleIcon from "~icons/basil/shuffle-solid";

import HomescreenPreview, {
  type HomescreenPreviewProps,
} from "./HomescreenPreview";

export interface HomescreenPreviewWithCustomizationIconProps
  extends HomescreenPreviewProps {
  alternativeManifestIconPageUrlQuery?: Record<string, string>;
}

const HomescreenPreviewWithIconCustomization: FC<
  HomescreenPreviewWithCustomizationIconProps
> = ({
  pageName,
  pageIcon,
  arrowLabel,
  radius,
  alternativeManifestIconPageUrlQuery,
  ...otherProps
}) => {
  // == Manifest icons
  const params = useQueryParams();
  const alternatePageUrl = usePageUrlWithAlternativeManifestIcon(
    alternativeManifestIconPageUrlQuery,
  );

  return (
    <Stack gap="xs" {...otherProps}>
      <HomescreenPreview
        pageIcon={params.manifest_icon_type === "generic" ? null : pageIcon}
        {...{ pageName, arrowLabel, radius }}
      />
      <Button
        component="a"
        href={alternatePageUrl}
        size="compact-sm"
        leftSection={<Box component={ShuffleIcon} fz="lg" />}
        style={{ alignSelf: "center" }}
      >
        use{" "}
        {params.manifest_icon_type === "generic"
          ? possessive(pageName)
          : "alternative"}{" "}
        icon
      </Button>
    </Stack>
  );
};

export default HomescreenPreviewWithIconCustomization;

const usePageUrlWithAlternativeManifestIcon = (
  query?: Record<string, string>,
): string | undefined => {
  const { url: pageUrl } = usePage();
  const [alternateUrl, setAlternateUrl] = useState<string>();
  useEffect(() => {
    const url = new URL(pageUrl, location.origin);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    const iconType = url.searchParams.get("manifest_icon_type");
    if (iconType === "generic") {
      url.searchParams.delete("manifest_icon_type");
    } else {
      url.searchParams.set("manifest_icon_type", "generic");
    }
    setAlternateUrl(url.toString());
  }, [pageUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  return alternateUrl;
};
