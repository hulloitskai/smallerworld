import { Text } from "@mantine/core";

import { type DrawerModalProps } from "~/components/DrawerModal";
import { type Invitation } from "~/types";

import DrawerModal from "./DrawerModal";
import EditInvitationForm from "./EditInvitationForm";
import InvitationQRCode from "./InvitationQRCode";
import SendInviteLinkButton from "./SendInviteLinkButton";

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
    <Stack gap="lg">
      <EditInvitationForm {...{ invitation, opened, onInvitationUpdated }} />
      <Divider variant="dashed" mx="calc(var(--mantine-spacing-md) * -1)" />
      <Stack gap="lg" align="center">
        <Box ta="center">
          <Title order={3} lh="xs">
            {invitation.invitee_name}&apos;s invite link
          </Title>
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
