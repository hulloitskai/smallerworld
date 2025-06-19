export const emojiFromUnified = (unified: string): string =>
  unified
    .split("-")
    .map(hex => String.fromCodePoint(parseInt(hex, 16)))
    .join("");

export const emojiToUnified = (emoji: string): string =>
  [...emoji]
    .map(char => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");

export const emojiImageSrc = (emoji: string): string => {
  const unified = emojiToUnified(emoji);
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${unified}.png`;
};
