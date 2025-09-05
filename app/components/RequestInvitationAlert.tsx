import { type AlertProps, Text } from "@mantine/core";

import RequestIcon from "~icons/heroicons/hand-raised-20-solid";

import { type UserProfile } from "~/types";

import RequestInvitationDrawerModal from "./RequestInvitationDrawerModal";

import classes from "./RequestInvitationAlert.module.css";

export interface RequestInvitationAlertProps
  extends Omit<AlertProps, "children">,
    Omit<ComponentPropsWithoutRef<"div">, "style" | "title" | "color"> {
  user: UserProfile;
  invitationRequested: boolean;
}

const RequestInvitationAlert: FC<RequestInvitationAlertProps> = ({
  user,
  invitationRequested,
  className,
  ...otherProps
}) => {
  const [showDrawerModal, setShowDrawerModal] = useState(false);
  const queryParams = useQueryParams();
  useEffect(() => {
    if (queryParams.intent === "join" && !invitationRequested) {
      setShowDrawerModal(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Alert
        variant="filled"
        icon={<NotificationIcon />}
        title={
          <>
            hear about what&apos;s *
            <span style={{ fontWeight: 900 }}>actually</span>* going on in my
            life :)
          </>
        }
        className={cn("RequestInvitationAlert", classes.alert, className)}
        {...otherProps}
      >
        <Stack gap={8} align="start">
          <Text inherit>
            get notified about my thoughts, ideas, and invitations to events
            i&apos;m going to.
          </Text>
          <Button
            className={classes.button}
            variant="white"
            size="compact-sm"
            leftSection={<RequestIcon />}
            disabled={invitationRequested}
            onClick={() => {
              setShowDrawerModal(true);
            }}
          >
            {invitationRequested
              ? "invitation requested"
              : "request invitation"}
          </Button>
        </Stack>
      </Alert>
      <RequestInvitationDrawerModal
        opened={showDrawerModal}
        onClose={() => {
          setShowDrawerModal(false);
        }}
        onJoinRequestCreated={() => {
          router.reload({ only: ["invitationRequested"], async: true });
        }}
        {...{ user }}
      />
    </>
  );
};

export default RequestInvitationAlert;
