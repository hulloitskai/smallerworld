import { emojiToUnified } from "./emojiPicker";

export const EMOJI_STICKER_BORDER_SIZE = 4.4;
export const EMOJI_STICKER_SIZE = 44 + EMOJI_STICKER_BORDER_SIZE * 2;

export interface StickerDragData {
  emoji: string;
  cursorOffset: {
    x: number;
    y: number;
  };
}

export const emojiStickerSrc = (emoji: string): string => {
  const unified = emojiToUnified(emoji);
  return unifiedEmojiStickerSrc(unified);
};

export const unifiedEmojiStickerSrc = (unified: string): string =>
  `https://tttkkdzhzvelxmbcqvlg.supabase.co/storage/v1/object/public/emoji-stickers/${unified}.png`;

export const preloadEmojiStickerByUnified = (unified: string) => {
  const img = document.createElement("img");
  img.src = unifiedEmojiStickerSrc(unified);
};
