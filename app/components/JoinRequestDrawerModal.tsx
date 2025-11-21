import { type DrawerProps } from "@mantine/core";

import DrawerModal from "./DrawerModal";
import JoinRequestForm, { type JoinRequestFormProps } from "./JoinRequestForm";

export interface JoinRequestDrawerModalProps
  extends Pick<DrawerProps, "opened" | "onClose">,
    Pick<JoinRequestFormProps, "world" | "onJoinRequestCreated"> {}

const JoinRequestDrawerModal: FC<JoinRequestDrawerModalProps> = ({
  world,
  onJoinRequestCreated,
  ...otherProps
}) => (
  <DrawerModal
    title={<>request an invitation to {world.name}</>}
    {...otherProps}
  >
    <JoinRequestForm {...{ world, onJoinRequestCreated }} />
  </DrawerModal>
);

export default JoinRequestDrawerModal;
