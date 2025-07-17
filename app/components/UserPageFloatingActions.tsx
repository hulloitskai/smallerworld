import { Affix } from "@mantine/core";

import UserPageInvitationsButton from "./UserPageInvitationsButton";

import classes from "./UserPageFloatingActions.module.css";

export interface UserPageFloatingActionsProps {}

const UserPageFloatingActions: FC<UserPageFloatingActionsProps> = () => (
  <>
    <Space className={classes.space} />
    <Affix className={classes.affix} position={{}} zIndex={180}>
      <Group
        align="end"
        justify="center"
        gap={8}
        style={{ pointerEvents: "none" }}
      >
        <UserPageInvitationsButton />
      </Group>
    </Affix>
  </>
);

export default UserPageFloatingActions;
