import { CopyButton, Text } from "@mantine/core";

import ShareIcon from "~icons/heroicons/share-20-solid";

import { type WorldFriend } from "~/types";

import Drawer, { type DrawerProps } from "./Drawer";
import PlainQRCode from "./PlainQRCode";

import "@mantine/carousel/styles.layer.css";

export interface WorldFriendInviteDrawerProps
  extends Omit<DrawerProps, "children"> {
  friend: WorldFriend;
}

const WorldFriendInviteDrawer: FC<WorldFriendInviteDrawerProps> = ({
  friend,
  opened,
  ...otherProps
}) => {
  const { data } = useRouteSWR<{ inviteUrl: string }>(
    routes.worldFriends.inviteUrl,
    {
      params: opened ? { id: friend.id } : null,
      descriptor: "load invite link",
      keepPreviousData: true,
    },
  );
  const { inviteUrl } = data ?? {};
  return (
    <Drawer
      title={`invite ${friend.name} to your world!`}
      {...{ opened }}
      {...otherProps}
    >
      <Stack gap="lg" align="center">
        <Text size="sm" c="dimmed" display="block" ta="center">
          get your friend to scan this QR code,
          <br />
          or send them the link using the button below
        </Text>
        <Stack gap="xs" align="center">
          {inviteUrl ? (
            <PlainQRCode value={inviteUrl} />
          ) : (
            <Skeleton width={160} height={160} />
          )}
          <Divider label="or" w="100%" maw={120} mx="auto" />
          <Center>
            <SendInviteLinkButton {...{ inviteUrl }} />
          </Center>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default WorldFriendInviteDrawer;

interface SendInviteLinkButtonProps {
  inviteUrl: string | undefined;
}

const SendInviteLinkButton: FC<SendInviteLinkButtonProps> = ({ inviteUrl }) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const inviteShareData = useMemo(() => {
    if (!inviteUrl) {
      return;
    }
    const shareData: ShareData = {
      text: "you're invited to join my smaller world",
      url: inviteUrl,
    };
    if (navigator.canShare(shareData)) {
      return shareData;
    }
  }, [inviteUrl]);

  return (
    <Menu width={140} portalProps={{ target: vaulPortalTarget }}>
      <Menu.Target>
        <Button
          variant="filled"
          leftSection={<SendIcon />}
          disabled={!inviteUrl}
        >
          send invite link
        </Button>
      </Menu.Target>
      {!!inviteUrl && (
        <Menu.Dropdown>
          <CopyButton value={inviteUrl}>
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
          {inviteShareData && (
            <Menu.Item
              leftSection={<ShareIcon />}
              closeMenuOnClick={false}
              onClick={() => {
                void navigator.share(inviteShareData);
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
