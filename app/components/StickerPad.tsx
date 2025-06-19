import { AspectRatio, Loader, Text } from "@mantine/core";
import { uuid4 } from "@sentry/core";
import type Konva from "konva";
import { partition } from "lodash-es";
import { Layer, Stage } from "react-konva";

import {
  EMOJI_STICKER_BORDER_SIZE,
  EMOJI_STICKER_SIZE,
  type StickerDragData,
} from "~/helpers/stickers";
import { type PostSticker } from "~/types";

import EmojiSticker from "./EmojiSticker";

import classes from "./StickerPad.module.css";

export interface StickerPadProps extends BoxProps {
  postId: string;
  stickers: PostSticker[];
  optimisticallyUpdateStickers: (
    update: (stickers: PostSticker[]) => PostSticker[],
  ) => Promise<void>;
}

const StickerPad = forwardRef<HTMLDivElement, StickerPadProps>(
  (
    {
      className,
      postId,
      stickers,
      optimisticallyUpdateStickers,
      ...otherProps
    },
    ref,
  ) => {
    const { ref: containerRef, ...containerSize } = useElementSize();
    const stageRef = useRef<Konva.Stage>(null);
    const [draggingOver, setDraggingOver] = useState(false);
    const currentFriend = useCurrentFriend();
    const [ownStickers, otherStickers] = useMemo(() => {
      if (!currentFriend) {
        return [[], stickers];
      }
      return partition(
        stickers,
        sticker => sticker.friend_id === currentFriend.id,
      );
    }, [stickers, currentFriend]);

    // == Create sticker
    const { trigger: triggerCreate, mutating: creatingSticker } =
      useRouteMutation<
        {
          sticker: PostSticker;
        },
        {
          id: string;
          emoji: string;
          relative_position: { x: number; y: number };
        }
      >(routes.postStickers.create, {
        params: currentFriend
          ? {
              post_id: postId,
              query: {
                friend_token: currentFriend.access_token,
              },
            }
          : null,
        descriptor: "create sticker",
        serializeData: data => ({ sticker: data }),
      });

    return (
      <Card
        {...{ ref }}
        className={cn("StickerPad", classes.card, className)}
        withBorder
        mod={{ "dragging-over": draggingOver }}
        onDragEnter={event => {
          event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={() => {
          setDraggingOver(false);
        }}
        onDragOver={event => {
          setDraggingOver(true);
          event.preventDefault();
        }}
        onDrop={event => {
          event.preventDefault();

          if (!currentFriend) {
            toast.warning("you must be invited to this page to add a sticker");
            return;
          }

          setDraggingOver(false);
          const rawDragData = event.dataTransfer.getData(
            "application/x.sticker-drag-data",
          );
          if (!rawDragData) {
            return;
          }
          const { emoji, cursorOffset }: StickerDragData =
            JSON.parse(rawDragData);

          const stage = stageRef.current;
          if (!stage) {
            return;
          }

          stage.setPointersPositions(event);
          const pointerPosition = stage.getPointerPosition();
          if (!pointerPosition) {
            return;
          }

          const sticker = {
            id: uuid4(),
            emoji,
            relative_position: {
              x:
                (pointerPosition.x -
                  cursorOffset.x -
                  EMOJI_STICKER_BORDER_SIZE) /
                (containerSize.width - EMOJI_STICKER_SIZE),
              y:
                (pointerPosition.y -
                  cursorOffset.y -
                  EMOJI_STICKER_BORDER_SIZE) /
                (containerSize.height - EMOJI_STICKER_SIZE),
            },
          };
          void optimisticallyUpdateStickers(stickers => [
            ...stickers,
            { ...sticker, friend_id: currentFriend.id, justDropped: true },
          ]);
          void triggerCreate(sticker, { revalidate: false });
        }}
        {...otherProps}
      >
        <Center className={classes.background}>
          {creatingSticker ? (
            <Loader />
          ) : (
            <Text
              className={classes.label}
              mod={{ "dragging-over": draggingOver }}
            >
              {draggingOver ? "drop sticker here!" : "sticker pad"}
            </Text>
          )}
        </Center>
        <AspectRatio
          ref={containerRef}
          className={classes.container}
          ratio={16 / 9}
        >
          <Stage ref={stageRef} {...containerSize}>
            {!isEmpty(ownStickers) && (
              <Layer>
                {ownStickers.map(sticker => (
                  <EmojiSticker
                    key={sticker.id}
                    canvasSize={containerSize}
                    {...{ postId, sticker, optimisticallyUpdateStickers }}
                    draggable
                  />
                ))}
              </Layer>
            )}
            {!isEmpty(otherStickers) && (
              <Layer listening={false}>
                {otherStickers.map(sticker => (
                  <EmojiSticker
                    key={sticker.id}
                    canvasSize={containerSize}
                    {...{ postId, sticker, optimisticallyUpdateStickers }}
                  />
                ))}
              </Layer>
            )}
          </Stage>
        </AspectRatio>
      </Card>
    );
  },
);

export default StickerPad;
