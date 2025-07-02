import { type MenuProps } from "@mantine/core";

import classes from "./DeleteConfirmation.module.css";

export interface DeleteConfirmationProps extends Omit<MenuProps, "classNames"> {
  label?: ReactNode;
  onConfirm: () => void;
}

const DeleteConfirmation: FC<DeleteConfirmationProps> = ({
  label,
  children,
  onConfirm,
  ...otherProps
}) => (
  <Menu
    classNames={{
      dropdown: classes.menuDropdown,
      arrow: classes.menuArrow,
    }}
    {...otherProps}
  >
    <Menu.Target>{children}</Menu.Target>
    <Menu.Dropdown>
      <Menu.Item color="red" leftSection={<AlertIcon />} onClick={onConfirm}>
        {label ?? "really delete?"}
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);

export default DeleteConfirmation;
