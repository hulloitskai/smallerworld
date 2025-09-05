import { Affix } from "@mantine/core";
import { useModals } from "@mantine/modals";

import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { useUserPageDialogOpened } from "~/helpers/userPages";
import { type UserPageProps } from "~/pages/UserPage";

import RequestInvitationAlert from "./RequestInvitationAlert";

import classes from "./UserPageRequestInvitationAlert.module.css";

export interface UserPageRequestInvitationAlertProps {}

export const UserPageRequestInvitationAlert: FC<
  UserPageRequestInvitationAlertProps
> = () => {
  const { user, invitationRequested } = usePageProps<UserPageProps>();
  const { modals } = useModals();

  // == Page modal state
  const pageDialogOpened = useUserPageDialogOpened();

  return (
    <Affix className={classes.affix} position={{}} zIndex={180}>
      <Transition
        transition="pop"
        mounted={isEmpty(modals) && !pageDialogOpened}
        enterDelay={100}
      >
        {transitionStyle => (
          <RequestInvitationAlert
            {...{ user, invitationRequested }}
            className={classes.alert}
            style={transitionStyle}
          />
        )}
      </Transition>
    </Affix>
  );
};
