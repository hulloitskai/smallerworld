import { type ButtonProps, CopyButton } from "@mantine/core";

import ShareIcon from "~icons/heroicons/share-20-solid";

import {
  useInvitationMessage,
  useInvitationShareData,
} from "~/helpers/invitations";
import { type Invitation } from "~/types";

export interface SendInviteLinkButtonProps extends ButtonProps {
  invitation: Invitation;
}

const SendInviteLinkButton: FC<SendInviteLinkButtonProps> = ({
  invitation,
  ...otherProps
}) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const invitationMessage = useInvitationMessage(invitation);
  const invitationShareData = useInvitationShareData(invitation);
  return (
    <Menu width={140} portalProps={{ target: vaulPortalTarget }}>
      <Menu.Target>
        <Button
          variant="filled"
          leftSection={<SendIcon />}
          disabled={!invitationMessage}
          {...otherProps}
        >
          send invite link via...
        </Button>
      </Menu.Target>
      {!!invitationMessage && (
        <Menu.Dropdown>
          <CopyButton value={invitationMessage}>
            {({ copied, copy }) => (
              <Menu.Item
                leftSection={copied ? <CopiedIcon /> : <CopyIcon />}
                closeMenuOnClick={false}
                onClick={copy}
              >
                {copied ? "link copied!" : "copy link"}
              </Menu.Item>
            )}
          </CopyButton>
          {invitationShareData && (
            <Menu.Item
              leftSection={<ShareIcon />}
              closeMenuOnClick={false}
              onClick={() => {
                void navigator.share(invitationShareData);
              }}
            >
              share via...
            </Menu.Item>
          )}
        </Menu.Dropdown>
      )}
    </Menu>
  );
};

export default SendInviteLinkButton;
