import { CloseButton, Loader } from "@mantine/core";
import parseSrcset from "@prettier/parse-srcset";
import Lightbox, {
  type LightboxExternalProps,
  type Plugin,
  type SlideImage,
  useController,
} from "yet-another-react-lightbox";
import DownloadPlugin from "yet-another-react-lightbox/plugins/download";
import LightboxZoomPlugin from "yet-another-react-lightbox/plugins/zoom";

import DownloadIcon from "~icons/heroicons/arrow-down-tray-20-solid";
import PrevIcon from "~icons/heroicons/chevron-left-20-solid";
import NextIcon from "~icons/heroicons/chevron-right-20-solid";
import ZoomOutIcon from "~icons/heroicons/magnifying-glass-minus-20-solid";
import ZoomInIcon from "~icons/heroicons/magnifying-glass-plus-20-solid";

import { type Dimensions, type Image } from "~/types";

import classes from "./AppLightbox.module.css";

export interface AppLightboxProps
  extends Omit<
    LightboxExternalProps,
    "slides" | "on" | "carousel" | "controller" | "render"
  > {
  images: Image[];
  onIndexChange: (index: number) => void;
}

const AppLightbox: FC<AppLightboxProps> = ({
  className,
  images,
  onIndexChange,
  ...otherProps
}) => {
  const [plugins] = useState<Plugin[]>([LightboxZoomPlugin, DownloadPlugin]);
  const slides = useMemo(
    () =>
      images.map(image => ({
        src: image.src,
        download: {
          filename: image.filename,
          url: routes.images.download.path({ signed_id: image.signed_id }),
        },
        ...(image.dimensions && {
          ...slideImageOptionsFromDimensions(image, image.dimensions),
        }),
      })),
    [images],
  );
  return (
    <Lightbox
      className={cn("AppLightbox", classes.lightbox, className)}
      {...{ plugins }}
      carousel={{
        ...(images.length === 1 && {
          finite: true,
        }),
      }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
        closeOnPullUp: true,
      }}
      render={{
        buttonClose: () => <LightboxCloseButton />,
        buttonZoom: ({ zoomIn, zoomOut, zoom, maxZoom }) => (
          <Group key="zoom" gap={0} className={classes.zoomButtons}>
            <ActionIcon
              variant="transparent"
              size="lg"
              onClick={zoomOut}
              disabled={zoom <= 1}
            >
              <ZoomOutIcon />
            </ActionIcon>
            <ActionIcon
              variant="transparent"
              size="lg"
              onClick={zoomIn}
              disabled={zoom >= maxZoom}
            >
              <ZoomInIcon />
            </ActionIcon>
          </Group>
        ),
        iconLoading: () => <Loader />,
        iconDownload: () => <DownloadIcon />,
        ...(images.length > 1
          ? {
              iconPrev: () => (
                <Box component={PrevIcon} fz="xl" width={32} height={32} />
              ),
              iconNext: () => (
                <Box component={NextIcon} fz="xl" width={32} height={32} />
              ),
            }
          : {
              buttonNext: () => null,
              buttonPrev: () => null,
            }),
      }}
      on={{
        view: ({ index }) => {
          onIndexChange(index);
        },
      }}
      {...{ slides }}
      {...otherProps}
    />
  );
};

export default AppLightbox;

const slideImageOptionsFromDimensions = (
  image: Image,
  dimensions: Dimensions,
): Omit<SlideImage, "src"> => {
  const heightRatio = dimensions.height / dimensions.width;
  return {
    width: dimensions.width,
    height: dimensions.height,
    srcSet: image.srcset
      ? parseSrcset(image.srcset).map(({ source, width }) => {
          if (!width) {
            return {
              src: source.value,
              width: NaN,
              height: NaN,
            };
          }
          const height = width.value * heightRatio;
          return {
            src: source.value,
            width: width.value,
            height,
          };
        })
      : undefined,
  };
};

const LightboxCloseButton: FC = () => {
  const controller = useController();
  return (
    <CloseButton
      key="close"
      className={classes.closeButton}
      variant="transparent"
      size="lg"
      onClick={() => {
        controller.close();
      }}
    />
  );
};
