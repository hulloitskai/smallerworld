import { type Image, type Upload } from "~/types";

export const imageUpload = (image: Image): Upload => ({
  signedId: image.signed_id,
});
