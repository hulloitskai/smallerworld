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
    return {
      width: maxWidth,
      height: maxWidth / aspectRatio,
    };
  }
  return {
    width: maxHeight * aspectRatio,
    height: maxHeight,
  };
};
