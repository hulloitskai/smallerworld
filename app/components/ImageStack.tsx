import { CloseButton, getRadius, type ImageProps, Loader } from "@mantine/core";
import parseSrcset from "@prettier/parse-srcset";
import { motion, useMotionValue, useTransform } from "motion/react";
import { type ComponentProps } from "react";
import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import LightboxZoomPlugin from "yet-another-react-lightbox/plugins/zoom";

import PrevIcon from "~icons/heroicons/chevron-left-20-solid";
import NextIcon from "~icons/heroicons/chevron-right-20-solid";
import ZoomOutIcon from "~icons/heroicons/magnifying-glass-minus-20-solid";
import ZoomInIcon from "~icons/heroicons/magnifying-glass-plus-20-solid";

import { clampedImageDimensions } from "~/helpers/images";
import { type Dimensions, type Image as ImageType } from "~/types";

import classes from "./ImageStack.module.css";

export interface ImageStackProps
  extends Omit<BoxProps, "h" | "w" | "mah" | "maw">,
    Pick<
      StackImageProps,
      "maxHeight" | "maxWidth" | "flipBoundary" | "radius"
    > {
  images: ImageType[];
}

const IMAGE_ROTATIONS = [-1, 2, -2, 1];

const ImageStack: FC<ImageStackProps> = ({
  images,
  maxHeight,
  maxWidth,
  className,
  radius,
  flipBoundary,
  ...otherProps
}) => {
  const { ref: containerRef, width: containerWidth } = useElementSize();
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const [index, setIndex] = useState(0);
  const orderedImages = useMemo(
    () => [...images.slice(index), ...images.slice(0, index)],
    [images, index],
  );
  const maxClampedImageHeight = useMemo(() => {
    let h = 0;
    images.forEach(image => {
      const { height: clampedHeight } = clampedImageDimensions(
        image,
        maxWidth,
        maxHeight,
      );
      if (clampedHeight) {
        h = Math.max(h, clampedHeight);
      }
    });
    return h;
  }, [images, maxHeight, maxWidth]);
  return (
    <>
      <Box
        ref={containerRef}
        className={cn("ImageStack", classes.container, className)}
        h={maxClampedImageHeight + (images.length - 1) * 8}
        {...otherProps}
      >
        {orderedImages.map((image, i) => {
          const originalIndex = (i + index) % images.length;
          return (
            <StackImage
              key={image.id}
              {...{ image, maxHeight, radius, flipBoundary }}
              maxWidth={Math.min(maxWidth, containerWidth)}
              totalImages={orderedImages.length}
              index={i}
              rotation={
                images.length > 1 ? (IMAGE_ROTATIONS[originalIndex] ?? 0) : 0
              }
              onDragToFlipBoundary={() => {
                setIndex(prevIndex => (prevIndex + 1) % images.length);
              }}
              onClick={() => {
                setLightboxOpened(true);
              }}
            />
          );
        })}
      </Box>
      <Lightbox
        className={classes.lightbox}
        plugins={[LightboxZoomPlugin]}
        carousel={{
          ...(images.length === 1 && {
            finite: true,
          }),
        }}
        open={lightboxOpened}
        close={() => {
          setLightboxOpened(false);
        }}
        slides={images.map(image => ({
          src: image.src,
          ...(image.dimensions && {
            ...slideImageOptionsFromDimensions(image, image.dimensions),
          }),
        }))}
        {...{ index }}
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
              onClick={() => {
                setLightboxOpened(false);
              }}
            />
          ),
          buttonZoom: ({ zoomIn, zoomOut, zoom, maxZoom }) => (
            <Group key="zoom" gap={0} className={classes.lightboxZoomButtons}>
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
            setIndex(index);
          },
        }}
      />
    </>
  );
};

export default ImageStack;

interface StackImageProps
  extends Pick<ImageProps, "radius">,
    Pick<ComponentProps<typeof motion.img>, "onClick"> {
  image: ImageType;
  index: number;
  totalImages: number;
  maxHeight: number;
  maxWidth: number;
  rotation: number;
  flipBoundary: number;
  onDragToFlipBoundary: () => void;
}

const StackImage: FC<StackImageProps> = ({
  image,
  index,
  totalImages,
  maxHeight,
  maxWidth,
  radius,
  rotation,
  flipBoundary,
  onDragToFlipBoundary,
  onClick,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);
  const canDrag = totalImages > 1 && index === 0;
  const draggingRef = useRef(false);
  return (
    <motion.img
      className={classes.image}
      src={image.src}
      {...(image.srcset && { srcSet: image.srcset })}
      {...clampedImageDimensions(image, maxWidth, maxHeight)}
      {...(!canDrag && totalImages > 1 && { "data-blur": true })}
      style={{
        borderRadius: radius ? getRadius(radius) : 0,
        x,
        y,
        rotateX,
        rotateY,
        rotateZ: rotation,
        zIndex: totalImages - index,
        ...(canDrag && { cursor: "grab" }),
      }}
      initial={false}
      animate={{ top: (totalImages - 1 - index) * 8, scale: 1 - index * 0.06 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      draggable={false}
      drag={canDrag}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.75}
      onDragStart={() => {
        draggingRef.current = true;
      }}
      onDragEnd={(event, { offset }) => {
        draggingRef.current = false;
        if (
          Math.abs(offset.x) > flipBoundary ||
          Math.abs(offset.y) > flipBoundary
        ) {
          onDragToFlipBoundary();
        } else {
          event.stopImmediatePropagation();
          x.set(0);
          y.set(0);
        }
      }}
      onClick={event => {
        if (!draggingRef.current) {
          onClick?.(event);
        }
      }}
    />
  );
};

const slideImageOptionsFromDimensions = (
  image: ImageType,
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
