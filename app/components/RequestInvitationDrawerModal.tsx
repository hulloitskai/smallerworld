import { type DrawerProps } from "@mantine/core";

import DrawerModal from "./DrawerModal";
import RequestInvitationForm, {
  type RequestInvitationFormProps,
} from "./RequestInvitationForm";

export interface RequestInvitationDrawerModalProps
  extends Pick<DrawerProps, "opened" | "onClose">,
    Pick<RequestInvitationFormProps, "user" | "onJoinRequestCreated"> {}

const RequestInvitationDrawerModal: FC<RequestInvitationDrawerModalProps> = ({
  user,
  onJoinRequestCreated,
  ...otherProps
}) => (
  <DrawerModal
    title={<>request an invitation to {possessive(user.name)} world</>}
    {...otherProps}
  >
    <RequestInvitationForm {...{ user, onJoinRequestCreated }} />
  </DrawerModal>
);

export default RequestInvitationDrawerModal;
