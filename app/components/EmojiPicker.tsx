import { useMantineColorScheme } from "@mantine/core";
import _EmojiPicker, {
  EmojiStyle,
  type PickerProps,
  type Theme,
} from "emoji-picker-react";

import classes from "./EmojiPicker.module.css";

export interface EmojiPickerProps extends PickerProps {}

const EmojiPicker: FC<EmojiPickerProps> = ({
  className,
  reactionsDefaultOpen,
  ...otherProps
}) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <_EmojiPicker
      className={cn("EmojiPicker", classes.picker, className)}
      autoFocusSearch={!reactionsDefaultOpen}
      {...{ reactionsDefaultOpen }}
      previewConfig={{ showPreview: false }}
      lazyLoadEmojis
      emojiStyle={EmojiStyle.NATIVE}
      skinTonesDisabled
      theme={colorScheme as Theme}
      width={300}
      height={375}
      {...otherProps}
    />
  );
};

export default EmojiPicker;
