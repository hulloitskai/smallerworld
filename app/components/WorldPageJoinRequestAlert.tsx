import { Affix, type AlertProps, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import RequestInvitationIcon from "~icons/heroicons/hand-raised-20-solid";

import { usePageDialogOpened } from "~/helpers/pageDialog";
import { type WorldPageProps } from "~/helpers/worlds";

import JoinRequestDrawerModal from "./JoinRequestDrawerModal";

import classes from "./WorldPageJoinRequestAlert.module.css";

export interface WorldPageJoinRequestAlertProps
  extends Omit<AlertProps, "children"> {}

const WorldPageJoinRequestAlert: FC<WorldPageJoinRequestAlertProps> = ({
  style,
  className,
  ...otherProps
}) => {
  const { world, invitationRequested } = usePageProps<WorldPageProps>();
  const { modals } = useModals();
  const [drawerModalOpened, setDrawerModalOpened] = useState(false);

  // == Auto-open drawer
  useEffect(() => {
    const { intent } = queryParamsFromPath(location.href);
    if (intent === "join" && !invitationRequested) {
      setDrawerModalOpened(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // == Page dialog
  const pageDialogOpened = usePageDialogOpened(drawerModalOpened);

  return (
    <>
      <Affix
        className={cn("WorldPageJoinRequestAlert", classes.affix)}
        position={{}}
        zIndex={180}
      >
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
              className={cn(classes.alert, className)}
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
      <JoinRequestDrawerModal
        {...{ world }}
        opened={drawerModalOpened}
        onClose={() => {
          setDrawerModalOpened(false);
        }}
        onJoinRequestCreated={() => {
          router.reload({ only: ["invitationRequested"], async: true });
        }}
      />
    </>
  );
};

export default WorldPageJoinRequestAlert;
