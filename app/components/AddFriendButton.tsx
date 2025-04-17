import { type ButtonProps } from "@mantine/core";

import AddFriendIcon from "~icons/heroicons/user-plus-20-solid";

import openAddFriendModal, { type AddFriendModalProps } from "./AddFriendModal";

export interface AddFriendButtonProps
  extends Pick<
      AddFriendModalProps,
      "currentUser" | "fromJoinRequest" | "fromUser"
    >,
    Omit<ButtonProps, "children"> {}

const AddFriendButton: FC<AddFriendButtonProps> = ({
  currentUser,
  fromJoinRequest,
  fromUser,
  ...otherProps
}) => {
  return (
    <Button
      leftSection={<AddFriendIcon />}
      onClick={() => {
        openAddFriendModal({ currentUser, fromJoinRequest, fromUser });
      }}
      {...otherProps}
    >
      invite to your world
    </Button>
  );
};

export default AddFriendButton;
