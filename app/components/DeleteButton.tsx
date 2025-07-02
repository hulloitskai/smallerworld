import { type ButtonProps } from "@mantine/core";

import DeleteConfirmation, {
  type DeleteConfirmationProps,
} from "./DeleteConfirmation";

export interface DeleteButtonProps
  extends Pick<DeleteConfirmationProps, "onConfirm">,
    ButtonProps,
    Omit<ComponentPropsWithoutRef<"button">, "color" | "style"> {}

const DeleteButton: FC<DeleteButtonProps> = ({
  children,
  onConfirm,
  ...otherProps
}) => (
  <DeleteConfirmation {...{ onConfirm }}>
    <Button variant="default" leftSection={<DeleteIcon />} {...otherProps}>
      {children ?? "delete"}
    </Button>
  </DeleteConfirmation>
);

export default DeleteButton;
