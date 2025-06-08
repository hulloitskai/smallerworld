import { type Image } from "~/types";

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
