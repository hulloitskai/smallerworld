import { Popover, type PopoverProps, RemoveScroll } from "@mantine/core";
import { InPortal, OutPortal } from "react-reverse-portal";

import { useHtmlPortalNode } from "~/helpers/react-reverse-portal";

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
  const htmlPortalNode = useHtmlPortalNode();
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  return (
    <>
      {htmlPortalNode && (
        <InPortal node={htmlPortalNode}>
          <EmojiPicker
            className={classes.picker}
            {...pickerProps}
            onEmojiClick={(...args) => {
              onEmojiClick(...args);
              setOpened(false);
            }}
          />
        </InPortal>
      )}
      <Popover
        trapFocus
        shadow="lg"
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
          <RemoveScroll enabled={opened}>
            {htmlPortalNode && <OutPortal node={htmlPortalNode} />}
          </RemoveScroll>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};

export default EmojiPopover;
