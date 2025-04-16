import ShuffleIcon from "~icons/basil/shuffle-solid";

import HomeScreenPreview, {
  type HomeScreenPreviewProps,
} from "./HomeScreenPreview";

export interface HomeScreenPreviewWithCustomizationIconProps
  extends HomeScreenPreviewProps {}

const HomeScreenPreviewWithIconCustomization: FC<HomeScreenPreviewProps> = ({
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
      <HomeScreenPreview
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

export default HomeScreenPreviewWithIconCustomization;

const usePageUrlWithAlternativeManifestIcon = (): string => {
  const [pageUrl, setPageUrl] = useState("");
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
