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
  return aspectRatio > maxAspectRatio
    ? {
        width: maxWidth,
        height: maxWidth / aspectRatio,
      }
    : {
        width: maxHeight * aspectRatio,
        height: maxHeight,
      };
};
