import { Affix } from "@mantine/core";

import UserPageUpcomingEventsButton from "./UserPageUpcomingEventsButton";

import classes from "./UserPageFloatingActions.module.css";

export interface UserPageFloatingActionsProps {}

const UserPageFloatingActions: FC<UserPageFloatingActionsProps> = () => (
  <>
    <Space className={classes.space} />
    <Affix className={classes.affix} position={{}} zIndex={180}>
      <Center style={{ pointerEvents: "none" }}>
        <UserPageUpcomingEventsButton />
      </Center>
    </Affix>
  </>
);

export default UserPageFloatingActions;
