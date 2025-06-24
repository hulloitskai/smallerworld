import { CloseButton, Loader } from "@mantine/core";
import parseSrcset from "@prettier/parse-srcset";
import Lightbox, {
  type LightboxExternalProps,
  type SlideImage,
} from "yet-another-react-lightbox";
import LightboxZoomPlugin from "yet-another-react-lightbox/plugins/zoom";

import PrevIcon from "~icons/heroicons/chevron-left-20-solid";
import NextIcon from "~icons/heroicons/chevron-right-20-solid";
import ZoomOutIcon from "~icons/heroicons/magnifying-glass-minus-20-solid";
import ZoomInIcon from "~icons/heroicons/magnifying-glass-plus-20-solid";

import { type Dimensions, type Image } from "~/types";

import classes from "./AppLightbox.module.css";

export interface AppLightboxProps
  extends Omit<
    LightboxExternalProps,
    "slides" | "index" | "on" | "carousel" | "controller" | "render"
  > {
  images: Image[];
  onIndexChange: (index: number) => void;
}

const AppLightbox: FC<AppLightboxProps> = ({
  className,
  images,
  close,
  onIndexChange,
  ...otherProps
}) => {
  return (
    <Lightbox
      className={cn("AppLightbox", classes.lightbox, className)}
      plugins={[LightboxZoomPlugin]}
      slides={images.map(image => ({
        src: image.src,
        ...(image.dimensions && {
          ...slideImageOptionsFromDimensions(image, image.dimensions),
        }),
      }))}
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
        buttonClose: () => (
          <CloseButton
            key="close"
            className={classes.closeButton}
            variant="transparent"
            size="lg"
            onClick={close}
          />
        ),
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
      }}
      on={{
        view: ({ index }) => {
          onIndexChange(index);
        },
      }}
      {...{ close }}
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
