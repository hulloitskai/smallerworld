import { useId } from "@mantine/hooks";
import { EmojiStyle } from "emoji-picker-react";

import { emojiFromUnified } from "~/helpers/emojiPicker";
import {
  preloadEmojiStickerByUnified,
  type StickerDragData,
} from "~/helpers/stickers";

import EmojiPicker, { type EmojiPickerProps } from "./EmojiPicker";

import classes from "./StickerPicker.module.css";

export interface StickerPickerProps
  extends Omit<EmojiPickerProps, "width" | "searchDisabled" | "getEmojiUrl"> {
  onSelect: () => void;
}

const StickerPicker: FC<StickerPickerProps> = ({
  className,
  onSelect,
  ...otherProps
}) => {
  const pickerId = useId();
  useEffect(() => {
    const observer = new MutationObserver(() => {
      handleEmojiDragging(pickerId, onSelect);
    });
    const timeout = setTimeout(() => {
      handleEmojiDragging(pickerId, onSelect);
      const emojiList = document.querySelector<HTMLElement>(
        `.epr-main.${pickerId} .epr-emoji-list`,
      );
      if (emojiList) {
        observer.observe(emojiList, {
          childList: true,
          subtree: true,
        });
      }
    }, 100);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [pickerId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <EmojiPicker
      width="unset"
      className={cn("StickerPicker", classes.emojiPicker, pickerId, className)}
      searchDisabled
      hiddenEmojis={["1fae5"]}
      emojiStyle={EmojiStyle.APPLE}
      {...otherProps}
    />
  );
};

export default StickerPicker;

const handleEmojiDragging = (pickerId: string, onSelect: () => void) => {
  const emojis = document.querySelectorAll<HTMLImageElement>(
    `.epr-main.${pickerId} button.epr-btn > img:not([draggable])`,
  );
  const clickListener = function (this: HTMLImageElement, event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const dragStartListener = function (
    this: HTMLImageElement,
    event: DragEvent,
  ) {
    // Only proceed if dataTransfer is available
    const { dataTransfer } = event;
    if (!dataTransfer) {
      return;
    }

    // Proceed if button is an HTMLButtonElement and has data-unified=...
    const button = this.parentElement;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    if (!button.dataset.unified) {
      return;
    }

    // Set dragging flag and trigger onSelect after 400ms
    this.dataset.dragging = "true";
    setTimeout(() => {
      if (this.dataset.dragging) {
        onSelect();
      }
    }, 400);

    // Set drag data
    const emoji = emojiFromUnified(button.dataset.unified);
    const imageStyle = getComputedStyle(this);
    const paddingLeft = parseInt(imageStyle.getPropertyValue("padding-left"));
    const paddingTop = parseInt(imageStyle.getPropertyValue("padding-top"));
    const dragData: StickerDragData = {
      emoji,
      cursorOffset: {
        x: event.offsetX - paddingLeft,
        y: event.offsetY - paddingTop,
      },
    };
    dataTransfer.setData(
      "application/x.sticker-drag-data",
      JSON.stringify(dragData),
    );

    // Set drag effect
    dataTransfer.effectAllowed = "copy";

    // Preload sticker image
    preloadEmojiStickerByUnified(button.dataset.unified);
  };
  const dragEndListener = function (this: HTMLImageElement) {
    delete this.dataset.dragging;
  };
  emojis.forEach(emoji => {
    emoji.draggable = true;
    emoji.addEventListener("click", clickListener);
    emoji.addEventListener("dragstart", dragStartListener);
    emoji.addEventListener("dragend", dragEndListener);
  });
};
