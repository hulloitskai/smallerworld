import { type ButtonProps } from "@mantine/core";

import AddFriendIcon from "~icons/heroicons/user-plus-20-solid";

import CreateInvitationDrawer, {
  type CreateInvitationDrawerProps,
} from "./CreateInvitationDrawer";

export interface CreateInvitationButtonProps
  extends Pick<
      CreateInvitationDrawerProps,
      "fromJoinRequest" | "onInvitationCreated"
    >,
    Omit<ButtonProps, "children"> {}

const CreateInvitationButton: FC<CreateInvitationButtonProps> = ({
  fromJoinRequest,
  onInvitationCreated,
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
        invite a friend to your world
      </Button>
      <CreateInvitationDrawer
        {...{ fromJoinRequest, onInvitationCreated }}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
      />
    </>
  );
};

export default CreateInvitationButton;
