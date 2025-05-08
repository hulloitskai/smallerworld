import ShuffleIcon from "~icons/basil/shuffle-solid";

import HomescreenPreview, {
  type HomescreenPreviewProps,
} from "./HomescreenPreview";

export interface HomescreenPreviewWithCustomizationIconProps
  extends HomescreenPreviewProps {}

const HomescreenPreviewWithIconCustomization: FC<HomescreenPreviewProps> = ({
  pageName,
  pageIcon,
  arrowLabel,
  radius,
  ...otherProps
}) => {
  // == Manifest icons
  const { manifest_icon_type } = useQueryParams();
  const alternatePageUrl = usePageUrlWithAlternativeManifestIcon();

  return (
    <Stack gap="xs" {...otherProps}>
      <HomescreenPreview
        pageIcon={manifest_icon_type === "generic" ? null : pageIcon}
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
        {manifest_icon_type === "generic"
          ? possessive(pageName)
          : "alternative"}{" "}
        icon
      </Button>
    </Stack>
  );
};

export default HomescreenPreviewWithIconCustomization;

const usePageUrlWithAlternativeManifestIcon = (): string | undefined => {
  const [pageUrl, setPageUrl] = useState<string>();
  useEffect(() => {
    const url = new URL(location.href);
    const iconType = url.searchParams.get("manifest_icon_type");
    if (iconType === "generic") {
      url.searchParams.delete("manifest_icon_type");
    } else {
      url.searchParams.set("manifest_icon_type", "generic");
    }
    setPageUrl(url.toString());
  }, []);
  return pageUrl;
};
