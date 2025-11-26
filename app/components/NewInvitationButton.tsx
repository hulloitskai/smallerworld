import { type ButtonProps } from "@mantine/core";

import AddFriendIcon from "~icons/heroicons/user-plus-20-solid";

import NewInvitationDrawerModal, {
  type NewInvitationDrawerModalProps,
} from "./NewInvitationDrawerModal";

export interface NewInvitationButtonProps
  extends Pick<
      NewInvitationDrawerModalProps,
      "fromJoinRequest" | "onInvitationCreated"
    >,
    Omit<ButtonProps, "children"> {}

const NewInvitationButton: FC<NewInvitationButtonProps> = ({
  fromJoinRequest,
  onInvitationCreated,
  className,
  ...otherProps
}) => {
  const [modalOpened, setModalOpened] = useState(false);
  return (
    <>
      <Button
        leftSection={<AddFriendIcon />}
        className={cn("NewInvitationButton", className)}
        onClick={() => {
          setModalOpened(true);
        }}
        {...otherProps}
      >
        invite a friend to your world
      </Button>
      <NewInvitationDrawerModal
        {...{ fromJoinRequest, onInvitationCreated }}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
      />
    </>
  );
};

export default NewInvitationButton;
