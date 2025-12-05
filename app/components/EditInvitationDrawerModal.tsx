import { Text } from "@mantine/core";

import { type DrawerModalProps } from "~/components/DrawerModal";
import { type Invitation } from "~/types";

import DrawerModal from "./DrawerModal";
import EditInvitationForm from "./EditInvitationForm";
import InvitationQRCode from "./InvitationQRCode";
import SendInviteLinkButton from "./SendInviteLinkButton";

import classes from "./EditInvitationDrawerModal.module.css";

export interface EditInvitationDrawerModalProps
  extends Pick<DrawerModalProps, "opened" | "onClose"> {
  invitation: Invitation;
  onInvitationUpdated?: (invitation: Invitation) => void;
}

const EditInvitationDrawerModal: FC<EditInvitationDrawerModalProps> = ({
  opened,
  invitation,
  onInvitationUpdated,
  ...otherProps
}) => (
  <DrawerModal
    title="invite a friend to your world"
    {...{ opened }}
    {...otherProps}
  >
    <Stack>
      <EditInvitationForm {...{ invitation, opened, onInvitationUpdated }} />
      <Divider className={classes.divider} variant="dashed" />
      <Stack gap="lg" align="center">
        <Box ta="center">
          <Text size="md" ff="heading">
            {invitation.invitee_name}&apos;s invite link
          </Text>
          <Text size="sm" c="dimmed" display="block">
            get your friend to scan this QR code,
            <br />
            or send them the link using the button below
          </Text>
        </Box>
        <Stack gap="xs" align="center">
          <InvitationQRCode {...{ invitation }} />
          <Divider label="or" w="100%" maw={120} mx="auto" />
          <Center>
            <SendInviteLinkButton {...{ invitation }} />
          </Center>
        </Stack>
      </Stack>
    </Stack>
  </DrawerModal>
);

export default EditInvitationDrawerModal;
