import { getRadius, Image, type ImageProps } from "@mantine/core";
import { motion, useMotionValue, useTransform } from "motion/react";
import { type ComponentProps } from "react";

import { clampedImageDimensions } from "~/helpers/images";
import { type Image as ImageType } from "~/types";

import AppLightbox from "./AppLightbox";

import classes from "./ImageStack.module.css";

export interface ImageStackProps
  extends Omit<BoxProps, "h" | "w" | "mah" | "maw" | "children">,
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
      <AppLightbox
        open={lightboxOpened}
        close={() => {
          setLightboxOpened(false);
        }}
        onIndexChange={setIndex}
        {...{ images, index }}
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
    <Image
      component={motion.img}
      className={classes.image}
      src={image.src}
      {...(image.srcset && { srcSet: image.srcset })}
      {...clampedImageDimensions(image, maxWidth, maxHeight)}
      mod={{ blur: !canDrag && totalImages > 1 }}
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
