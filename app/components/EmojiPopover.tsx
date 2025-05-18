import { Popover, type PopoverProps } from "@mantine/core";

import EmojiPicker, { type EmojiPickerProps } from "./EmojiPicker";

import classes from "./EmojiPopover.module.css";

export interface EmojiPopoverChildrenProps {
  opened: boolean;
  open: () => void;
}

export interface EmojiPopoverProps
  extends Omit<PopoverProps, "children" | "opened" | "onChange" | "classNames">,
    Required<Pick<EmojiPickerProps, "onEmojiClick">> {
  children: (props: EmojiPopoverChildrenProps) => ReactNode;
  pickerProps?: Omit<EmojiPickerProps, "onEmojiClick">;
}

const EmojiPopover: FC<EmojiPopoverProps> = ({
  onEmojiClick,
  children,
  pickerProps,
  portalProps,
  ...otherProps
}) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  return (
    <Popover
      trapFocus
      shadow="lg"
      middlewares={{ flip: false }}
      portalProps={{
        target: vaulPortalTarget,
        ...portalProps,
      }}
      classNames={{ dropdown: classes.dropdown }}
      {...{ opened }}
      onChange={setOpened}
      {...otherProps}
    >
      <Popover.Target>{children({ opened, open })}</Popover.Target>
      <Popover.Dropdown>
        <EmojiPicker
          className={classes.picker}
          {...pickerProps}
          onEmojiClick={(...args) => {
            onEmojiClick(...args);
            setOpened(false);
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
};

export default EmojiPopover;
