import { type ButtonProps } from "@mantine/core";

import AddFriendIcon from "~icons/heroicons/user-plus-20-solid";

import AddFriendDrawer, { type AddFriendDrawerProps } from "./AddFriendDrawer";

export interface AddFriendButtonProps
  extends Pick<AddFriendDrawerProps, "fromJoinRequest" | "fromUser">,
    Omit<ButtonProps, "children"> {}

const AddFriendButton: FC<AddFriendButtonProps> = ({
  fromJoinRequest,
  fromUser,
  ...otherProps
}) => {
  const [modalOpened, setModalOpened] = useState(false);
  return (
    <>
      <Button
        leftSection={<AddFriendIcon />}
        onClick={() => {
          setModalOpened(true);
        }}
        {...otherProps}
      >
        invite to your world
      </Button>
      <AddFriendDrawer
        fromJoinRequest={fromJoinRequest}
        fromUser={fromUser}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
      />
    </>
  );
};

export default AddFriendButton;
