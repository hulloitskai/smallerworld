import { type Image } from "~/types";

export const IMAGE_CROP_CANCELLED_ERROR = new Error("Image crop cancelled");

export const clampedImageDimensions = (
  { dimensions }: Image,
  maxWidth: number,
  maxHeight: number,
): { width?: number; height?: number } => {
  if (!dimensions) {
    return {};
  }
  const { width, height } = dimensions;
  const aspectRatio = width / height;
  const maxAspectRatio = maxWidth / maxHeight;
  if (aspectRatio > maxAspectRatio) {
    const actualWidth = Math.min(maxWidth, width);
    return {
      width: actualWidth,
      height: actualWidth / aspectRatio,
    };
  }
  const actualHeight = Math.min(maxHeight, height);
  return {
    width: actualHeight * aspectRatio,
    height: actualHeight,
  };
};

const CROPPABLE_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/bmp",
  "image/gif",
  "image/tiff",
  "image/tif",
];

export const maybeCropImage = (file: File, aspect?: number): Promise<File> => {
  if (!aspect || !CROPPABLE_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return Promise.resolve(file);
  }
  return import("~/components/ImageCropperModal").then(
    ({ openImageCropperModal }) =>
      new Promise((resolve, reject) => {
        openImageCropperModal({
          file,
          aspect,
          onCropped: resolve,
          onCancelled: () => {
            reject(IMAGE_CROP_CANCELLED_ERROR);
          },
        });
      }),
  );
};
