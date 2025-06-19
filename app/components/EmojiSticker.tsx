import { useViewportSize } from "@mantine/hooks";
import Konva from "konva";
import { Image as KonvaImage } from "react-konva";
import { useImage } from "react-konva-utils";

import { confetti, puffOfSmoke } from "~/helpers/particles";
import { EMOJI_STICKER_SIZE, emojiStickerSrc } from "~/helpers/stickers";
import { type PostSticker } from "~/types";

export interface EmojiStickerProps
  extends Omit<Konva.ImageConfig, "image" | "x" | "y" | "width" | "height"> {
  canvasSize: {
    width: number;
    height: number;
  };
  postId: string;
  sticker: PostSticker & { justDropped?: boolean };
  optimisticallyUpdateStickers: (
    update: (stickers: PostSticker[]) => PostSticker[],
  ) => Promise<void>;
}

const EmojiSticker: FC<EmojiStickerProps> = ({
  postId,
  canvasSize,
  sticker,
  optimisticallyUpdateStickers,
  ...otherProps
}) => {
  const ref = useRef<Konva.Image>(null);
  const viewportSize = useViewportSize();

  // == Load and cache image
  const src = useMemo(() => emojiStickerSrc(sticker.emoji), [sticker.emoji]);
  const [image, status] = useImage(src, "anonymous");
  useEffect(() => {
    const node = ref.current;
    if (image && node) {
      node.cache();
    }
  }, [image]);

  // == Out of bounds
  const [outOfBounds, setOutOfBounds] = useState(false);

  // == Update sticker
  const { trigger: triggerUpdate } = useRouteMutation<
    { sticker: PostSticker },
    { relative_position: { x: number; y: number } }
  >(routes.postStickers.update, {
    params: {
      id: sticker.id,
    },
    descriptor: "update sticker",
    serializeData: data => ({ sticker: data }),
    onSuccess: () => {
      void mutateRoute(routes.postStickers.index, {
        post_id: postId,
      });
    },
  });

  // == Delete sticker
  const { trigger: triggerDelete } = useRouteMutation<
    { sticker: PostSticker },
    { id: string }
  >(routes.postStickers.destroy, {
    params: { id: sticker.id },
    descriptor: "delete sticker",
  });

  // == Launch confetti if sticker was just dropped
  const confettiLaunchedRef = useRef(false);
  const [shouldLaunchConfetti] = useState(!!sticker.justDropped);
  useEffect(() => {
    if (confettiLaunchedRef.current || !shouldLaunchConfetti) {
      return;
    }
    if (status !== "loaded") {
      return;
    }
    const image = ref.current;
    if (!image) {
      return;
    }
    const stage = image.getStage();
    invariant(stage, "Missing stage");
    const containerRect = stage.container().getBoundingClientRect();
    const imageRect = image.getClientRect({ skipShadow: true });
    confettiLaunchedRef.current = true;
    void confetti({
      position: {
        x:
          ((containerRect.left + imageRect.x + imageRect.width / 2) /
            viewportSize.width) *
          100,
        y:
          ((containerRect.top + imageRect.y + imageRect.height / 2) /
            viewportSize.height) *
          100,
      },
      spread: 200,
      ticks: 60,
      gravity: 1,
      startVelocity: 24,
      particleCount: 8,
      scalar: 2,
      shapes: ["emoji"],
      shapeOptions: {
        emoji: {
          value: sticker.emoji,
        },
      },
    });
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const setCursor = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
      const { style } = event.target?.getStage()?.container() ?? {};
      if (style) {
        style.cursor = cursor;
      }
    },
    [],
  );
  return (
    <>
      {image && (
        <KonvaImage
          ref={ref}
          {...{ image }}
          x={
            sticker.relative_position.x *
            (canvasSize.width - EMOJI_STICKER_SIZE)
          }
          y={
            sticker.relative_position.y *
            (canvasSize.height - EMOJI_STICKER_SIZE)
          }
          width={EMOJI_STICKER_SIZE}
          height={EMOJI_STICKER_SIZE}
          shadowColor="black"
          shadowBlur={8}
          shadowOffset={{ x: 0, y: 3 }}
          shadowOpacity={0.35}
          {...(outOfBounds && {
            filters: [Konva.Filters.RGB],
            red: 100,
            blue: 50,
            green: 50,
          })}
          onMouseOver={event => {
            setCursor(event, "grab");
          }}
          onMouseOut={event => {
            setCursor(event, "default");
          }}
          onDragMove={({ target }) => {
            const layer = target.getLayer();
            invariant(layer, "Missing layer");
            if (target.y() < 0) {
              setOutOfBounds(true);
            } else if (target.y() > layer.height() - target.height()) {
              setOutOfBounds(true);
            } else if (target.x() < 0) {
              setOutOfBounds(true);
            } else if (target.x() > layer.width() - target.width()) {
              setOutOfBounds(true);
            } else {
              setOutOfBounds(false);
            }
          }}
          onDragEnd={({ target }) => {
            if (outOfBounds) {
              void optimisticallyUpdateStickers(stickers =>
                stickers.filter(({ id }) => id !== sticker.id),
              );
              const stage = target.getStage();
              invariant(stage, "Missing stage");
              const containerRect = stage.container().getBoundingClientRect();
              const targetRect = target.getClientRect({ skipShadow: true });
              void puffOfSmoke({
                position: {
                  x:
                    ((containerRect.left +
                      targetRect.x +
                      targetRect.width / 2) /
                      viewportSize.width) *
                    100,
                  y:
                    ((containerRect.top +
                      targetRect.y +
                      targetRect.height / 2) /
                      viewportSize.height) *
                    100,
                },
              });
              void triggerDelete({ id: sticker.id }, { revalidate: false });
            } else {
              const { x, y } = target.getClientRect({ skipShadow: true });
              void triggerUpdate({
                relative_position: {
                  x: x / (canvasSize.width - EMOJI_STICKER_SIZE),
                  y: y / (canvasSize.height - EMOJI_STICKER_SIZE),
                },
              });
            }
          }}
          {...otherProps}
        />
      )}
    </>
  );
};

export default EmojiSticker;
