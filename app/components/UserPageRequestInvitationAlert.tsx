import { Affix, type AlertProps, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import RequestInvitationIcon from "~icons/heroicons/hand-raised-20-solid";

import { useUserPageDialogOpened } from "~/helpers/userPages";
import { type UserPageProps } from "~/pages/UserPage";

import RequestInvitationDrawerModal from "./RequestInvitationDrawerModal";

import classes from "./UserPageRequestInvitationAlert.module.css";

export interface UserPageRequestInvitationAlertProps
  extends Omit<AlertProps, "children"> {}

export const UserPageRequestInvitationAlert: FC<
  UserPageRequestInvitationAlertProps
> = ({ style, className, ...otherProps }) => {
  const { user, invitationRequested } = usePageProps<UserPageProps>();
  const { modals } = useModals();

  // == Drawer modal
  const [drawerModalOpened, setDrawerModalOpened] = useState(false);
  const queryParams = useQueryParams();
  useEffect(() => {
    if (queryParams.intent === "join" && !invitationRequested) {
      setDrawerModalOpened(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // == Page dialog
  const pageDialogOpened = useUserPageDialogOpened(drawerModalOpened);

  return (
    <>
      <Affix className={classes.affix} position={{}} zIndex={180}>
        <Transition
          transition="pop"
          mounted={isEmpty(modals) && !pageDialogOpened}
          enterDelay={100}
        >
          {transitionStyle => (
            <Alert
              variant="filled"
              icon={<NotificationIcon />}
              title={
                <>
                  hear about what&apos;s *
                  <span style={{ fontWeight: 900 }}>actually</span>* going on in
                  my life :)
                </>
              }
              className={cn(
                "UserPageRequestInvitationAlert",
                classes.alert,
                className,
              )}
              style={[style, transitionStyle]}
              {...otherProps}
            >
              <Stack gap={8} align="start">
                <Text inherit>
                  get notified about my thoughts, ideas, and invitations to
                  events i&apos;m going to.
                </Text>
                <Button
                  className={classes.button}
                  variant="white"
                  size="compact-sm"
                  leftSection={<RequestInvitationIcon />}
                  disabled={invitationRequested}
                  onClick={() => {
                    setDrawerModalOpened(true);
                  }}
                >
                  {invitationRequested
                    ? "invitation requested"
                    : "request invitation"}
                </Button>
              </Stack>
            </Alert>
          )}
        </Transition>
      </Affix>
      <RequestInvitationDrawerModal
        opened={drawerModalOpened}
        onClose={() => {
          setDrawerModalOpened(false);
        }}
        onJoinRequestCreated={() => {
          router.reload({ only: ["invitationRequested"], async: true });
        }}
        {...{ user }}
      />
    </>
  );
};
