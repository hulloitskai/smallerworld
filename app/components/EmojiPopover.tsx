import { Popover, type PopoverProps, RemoveScroll } from "@mantine/core";

import EmojiPicker, { type EmojiPickerProps } from "./EmojiPicker";

import classes from "./EmojiPopover.module.css";

export interface EmojiPopoverChildrenProps {
  open: () => void;
}

export interface EmojiPopoverProps
  extends Omit<PopoverProps, "children" | "opened" | "onChange">,
    Required<Pick<EmojiPickerProps, "onEmojiClick">> {
  children: (props: EmojiPopoverChildrenProps) => ReactNode;
}

const EmojiPopover: FC<EmojiPopoverProps> = ({
  onEmojiClick,
  children,
  ...otherProps
}) => {
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  return (
    <Popover
      trapFocus
      shadow="lg"
      opened={opened}
      classNames={{ dropdown: classes.dropdown }}
      onChange={setOpened}
      {...otherProps}
    >
      <Popover.Target>{children({ open })}</Popover.Target>
      <Popover.Dropdown>
        <RemoveScroll removeScrollBar={false}>
          <EmojiPicker
            className={classes.picker}
            onEmojiClick={(...args) => {
              onEmojiClick(...args);
              setOpened(false);
            }}
          />
        </RemoveScroll>
      </Popover.Dropdown>
    </Popover>
  );
};

export default EmojiPopover;
