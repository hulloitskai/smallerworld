import { Affix } from "@mantine/core";

import WorldPageInvitationsButton from "./WorldPageInvitationsButton";

import classes from "./WorldPageFloatingActions.module.css";

export interface WorldPageFloatingActionsProps {}

const WorldPageFloatingActions: FC<WorldPageFloatingActionsProps> = () => (
  <>
    <Space className={classes.space} />
    <Affix className={classes.affix} position={{}} zIndex={180}>
      <Group
        align="end"
        justify="center"
        gap={8}
        style={{ pointerEvents: "none" }}
      >
        <WorldPageInvitationsButton />
      </Group>
    </Affix>
  </>
);

export default WorldPageFloatingActions;
