import { type ButtonProps, CopyButton } from "@mantine/core";

import ShareIcon from "~icons/heroicons/share-20-solid";

import {
  useInvitationShareData,
  useInvitationShortlink,
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
  const invitationShortlink = useInvitationShortlink(invitation);
  const invitationShareData = useInvitationShareData(invitation);
  return (
    <Menu width={140} portalProps={{ target: vaulPortalTarget }}>
      <Menu.Target>
        <Button
          variant="filled"
          leftSection={<SendIcon />}
          disabled={!invitationShortlink || !invitationShareData}
          {...otherProps}
        >
          send invite link via...
        </Button>
      </Menu.Target>
      {!!invitationShortlink && (
        <Menu.Dropdown>
          <CopyButton value={invitationShortlink}>
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
