import {
  getRadius,
  type ImageProps,
  type InputWrapperProps,
} from "@mantine/core";
import { Image, Input, Text } from "@mantine/core";
import { type DropzoneProps } from "@mantine/dropzone";
import { Dropzone } from "@mantine/dropzone";
import { useUncontrolled } from "@mantine/hooks";
import { useId } from "react";

import PhotoIcon from "~icons/heroicons/photo-20-solid";

import { upload } from "~/helpers/upload";
import { type Image as ImageType, type Upload } from "~/types";

import classes from "./ImageInput.module.css";
import "@mantine/dropzone/styles.layer.css";

export interface ImageInputProps
  extends Omit<
      InputWrapperProps,
      | "defaultValue"
      | "inputContainer"
      | "inputWrapperOrder"
      | "size"
      | "children"
      | "onChange"
    >,
    Pick<ImageProps, "radius">,
    Pick<DropzoneProps, "disabled"> {
  value?: Upload | null;
  defaultValue?: Upload | null;
  previewProps?: ImageProps;
  previewFit?: ImageProps["fit"];
  onChange?: (value: Upload | null) => void;
  onPreviewChange?: (image: ImageType | null) => void;
  center?: boolean;
  showRemoveButton?: boolean;
}

const ImageInput: FC<ImageInputProps> = ({
  center,
  defaultValue,
  previewProps,
  previewFit,
  disabled,
  h = 140,
  label,
  labelProps,
  onChange,
  onPreviewChange,
  py = label ? 6 : undefined,
  w,
  radius,
  style,
  value,
  showRemoveButton = true,
  ...otherProps
}) => {
  // == Controlled input
  const [resolvedValue, handleChange] = useUncontrolled({
    value,
    defaultValue,
    onChange,
  });

  // == Load preview image
  const { data, mutate } = useRouteSWR<{
    image: ImageType | null;
  }>(routes.images.show, {
    descriptor: "load preview image",
    params: resolvedValue ? { signed_id: resolvedValue.signedId } : null,
  });
  const { image } = data ?? {};
  useDidUpdate(() => {
    onPreviewChange?.(image ?? null);
  }, [image]); // eslint-disable-line react-hooks/exhaustive-deps
  useDidUpdate(() => {
    void mutate();
  }, [resolvedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // == Loading
  const [uploading, setUploading] = useState(false);
  const loading: boolean = uploading || (!!value && !image);

  const inputId = useId();
  const {
    className: previewClassName,
    style: previewStyle,
    ...otherPreviewProps
  } = previewProps ?? {};
  return (
    <Input.Wrapper
      labelProps={{ htmlFor: inputId, ...labelProps }}
      {...{ label, py }}
      {...otherProps}
    >
      <Box {...{ w, h }} p={4} {...(center && { mx: "auto" })} pos="relative">
        <Image
          className={cn(classes.previewImage, previewClassName)}
          src={image?.src}
          {...(image?.srcset && { srcSet: image.srcset })}
          style={[
            { "--dropzone-radius": getRadius(radius), objectFit: previewFit },
            previewStyle,
          ]}
          {...otherPreviewProps}
        />
        <Dropzone
          className={classes.dropzone}
          accept={["image/png", "image/jpeg", "image/webp", "image/gif"]}
          multiple={false}
          onDrop={files => {
            const file = first(files);
            if (file) {
              setUploading(true);
              upload(file)
                .then(blob => {
                  const value = { signedId: blob.signed_id };
                  handleChange(value);
                })
                .catch(error => {
                  console.error("Failed to upload image", error);
                  if (error instanceof Error) {
                    toast.error("failed to upload image", {
                      description: error.message,
                    });
                  }
                })
                .finally(() => {
                  setUploading(false);
                });
            }
          }}
          {...{ radius }}
          pos="absolute"
          inset={0}
          inputProps={{ id: inputId }}
          mod={{ "with-src": !!image, disabled }}
          {...{ loading, disabled, style }}
        >
          <Stack align="center" gap={4}>
            <Box component={PhotoIcon} className={classes.dropzoneIcon} />
            <Text size="xs" c="dark.1" fw={500} style={{ textAlign: "center" }}>
              drag an image or click to upload
            </Text>
          </Stack>
        </Dropzone>
        {showRemoveButton && !!image && (
          <ActionIcon
            className={classes.removeButton}
            variant="subtle"
            radius="xl"
            size="sm"
            onClick={() => {
              handleChange(null);
            }}
          >
            <RemoveIcon />
          </ActionIcon>
        )}
      </Box>
    </Input.Wrapper>
  );
};

export default ImageInput;
