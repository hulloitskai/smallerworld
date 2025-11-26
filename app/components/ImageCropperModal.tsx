import { Image } from "@mantine/core";
import { Jimp } from "jimp";
import { type ModalSettings } from "node_modules/@mantine/modals/lib/context";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type PercentCrop,
} from "react-image-crop";

import classes from "./ImageCropperModal.module.css";
import "react-image-crop/dist/ReactCrop.css";

type JimpInstance = Awaited<ReturnType<typeof Jimp.read>>;

export interface ImageCropperModalProps
  extends Omit<ModalSettings, "children" | "onClose">,
    ImageCropperModalBodyProps {}

export const openImageCropperModal = ({
  file,
  aspect,
  onCropped,
  onCancelled,
  ...otherProps
}: ImageCropperModalProps): void => {
  const modalId = randomId();
  openModal({
    modalId,
    withCloseButton: false,
    centered: true,
    styles: {
      content: {
        backgroundColor: "transparent",
        boxShadow: "none",
      },
    },
    children: (
      <ImageCropperModalBody
        {...{ file, aspect }}
        onCropped={file => {
          closeModal(modalId);
          onCropped(file);
        }}
        onCancelled={() => {
          closeModal(modalId);
          onCancelled();
        }}
      />
    ),
    mod: {
      "disable-auto-fullscreen": true,
    },
    ...otherProps,
  });
};

interface ImageCropperModalBodyProps {
  file: File;
  aspect?: number;
  onCropped: (file: File) => void;
  onCancelled: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
const ImageCropperModalBody: FC<ImageCropperModalBodyProps> = ({
  file,
  aspect,
  onCropped,
  onCancelled,
}) => {
  const [crop, setCrop] = useState<PercentCrop>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    unit: "%",
  });
  const [src] = useState(() => URL.createObjectURL(file));
  const [processing, setProcessing] = useState(false);

  // == Jimp
  const [jimpImage, setJimpImage] = useState<JimpInstance>();
  useEffect(() => {
    void file.arrayBuffer().then(async arrayBuffer => {
      const image = await Jimp.read(arrayBuffer);
      setJimpImage(image);
      if (aspect) {
        const { width, height } = image;
        const defaultCrop = centerCrop(
          makeAspectCrop(
            { unit: "%", width: 100, height: 100 },
            aspect,
            width,
            height,
          ),
          width,
          height,
        );
        setCrop(defaultCrop);
      }
    });
  }, [file, aspect]);

  return (
    <Stack gap="xs">
      <ReactCrop
        {...{ crop, aspect }}
        onChange={(pixelCrop, percentCrop) => {
          setCrop(percentCrop);
        }}
        keepSelection
        className={classes.cropper}
      >
        <Image {...{ src }} mah="75dvh" style={{ pointerEvents: "none" }} />
      </ReactCrop>
      <Group gap="xs" justify="center">
        <Button
          variant="filled"
          leftSection={<SuccessIcon />}
          loading={processing}
          disabled={!jimpImage}
          onClick={() => {
            invariant(jimpImage, "Missing jimp");
            setProcessing(true);
            const { width, height } = jimpImage;
            void jimpImage
              .crop({
                x: (crop.x * width) / 100,
                y: (crop.y * height) / 100,
                w: (crop.width * width) / 100,
                h: (crop.height * height) / 100,
              })
              .getBuffer("image/png")
              .then(croppedBuffer => {
                const croppedFile = new File([croppedBuffer], file.name, {
                  type: "image/png",
                });
                onCropped(croppedFile);
              })
              .finally(() => {
                setProcessing(false);
              });
          }}
        >
          continue
        </Button>
        <Button
          variant="transparent"
          color="white"
          onClick={onCancelled}
          leftSection={<CancelIcon />}
        >
          cancel
        </Button>
      </Group>
    </Stack>
  );
};
