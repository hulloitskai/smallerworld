import { Affix, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import RequestInvitationIcon from "~icons/heroicons/hand-raised-20-solid";

import { useUserPageDialogOpened } from "~/helpers/userPages";
import { type User } from "~/types";

import RequestInvitationDrawerModal from "./RequestInvitationDrawerModal";

import classes from "./UserPageRequestInvitationAlert.module.css";

export interface UserPageRequestInvitationAlertProps {
  user: User;
}

export const UserPageRequestInvitationAlert: FC<
  UserPageRequestInvitationAlertProps
> = ({ user }) => {
  const { modals } = useModals();

  // == Drawer modal
  const [showDrawerModal, setShowDrawerModal] = useState(false);

  // == Auto-open modal
  const { intent } = useQueryParams();
  useEffect(() => {
    if (intent === "join") {
      setShowDrawerModal(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // == Page modal state
  const pageDialogOpened = useUserPageDialogOpened(showDrawerModal);

  return (
    <>
      <Affix className={classes.affix} position={{}}>
        <Transition
          transition="pop"
          mounted={isEmpty(modals) && !pageDialogOpened}
          enterDelay={100}
        >
          {style => (
            <Alert
              variant="filled"
              icon={<NotificationIcon />}
              title="stay in the loop!"
              className={classes.alert}
              {...{ style }}
            >
              <Stack gap={8} align="start">
                <Text inherit>
                  get notified about life updates, personal invitations, poems,
                  and more!
                </Text>
                <Button
                  variant="white"
                  size="compact-sm"
                  leftSection={<RequestInvitationIcon />}
                  className={classes.button}
                  mb={1}
                  onClick={() => {
                    setShowDrawerModal(true);
                  }}
                >
                  request invitation
                </Button>
              </Stack>
            </Alert>
          )}
        </Transition>
      </Affix>
      <RequestInvitationDrawerModal
        opened={showDrawerModal}
        onClose={() => {
          setShowDrawerModal(false);
        }}
        {...{ user }}
      />
    </>
  );
};
