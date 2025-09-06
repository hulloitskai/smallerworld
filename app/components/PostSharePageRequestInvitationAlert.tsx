import { type AlertProps, Text } from "@mantine/core";

import { type PostSharePageProps } from "~/pages/PostSharePage";

import RequestInvitationForm from "./RequestInvitationForm";

import classes from "./PostSharePageRequestInvitationAlert.module.css";

export interface PostSharePageRequestInvitationAlertProps
  extends Omit<AlertProps, "children"> {}

const PostSharePageRequestInvitationAlert: FC<
  PostSharePageRequestInvitationAlertProps
> = ({ style, className, ...otherProps }) => {
  const { user, invitationRequested } = usePageProps<PostSharePageProps>();
  return (
    <Transition transition="pop" mounted={!invitationRequested}>
      {transitionStyle => (
        <Alert
          variant="default"
          icon={<NotificationIcon />}
          title="hear more about what's going on in my life :)"
          className={cn(
            "PostSharePageRequestInvitationAlert",
            classes.alert,
            className,
          )}
          style={[style, transitionStyle]}
          {...otherProps}
        >
          <Stack gap={8}>
            <Text inherit>
              get notified about my thoughts, ideas, and invitations to events
              i&apos;m going to.
            </Text>
            <RequestInvitationForm {...{ user }} />
          </Stack>
        </Alert>
      )}
    </Transition>
  );
};

export default PostSharePageRequestInvitationAlert;
