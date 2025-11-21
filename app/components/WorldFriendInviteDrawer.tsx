import { Text } from "@mantine/core";

import { type Invitation, type UserWorldFriendProfile } from "~/types";

import Drawer, { type DrawerProps } from "./Drawer";
import InvitationQRCode from "./InvitationQRCode";
import SendInviteLinkButton from "./SendInviteLinkButton";

import "@mantine/carousel/styles.layer.css";

export interface WorldFriendInviteDrawerProps
  extends Omit<DrawerProps, "children"> {
  friend: UserWorldFriendProfile;
}

const WorldFriendInviteDrawer: FC<WorldFriendInviteDrawerProps> = ({
  friend,
  opened,
  ...otherProps
}) => {
  const { data } = useRouteSWR<{ invitation: Invitation }>(
    routes.userWorldFriends.invitation,
    {
      params: opened ? { id: friend.id } : null,
      descriptor: "load invitation details",
      keepPreviousData: true,
    },
  );
  const { invitation } = data ?? {};
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
          {invitation ? (
            <InvitationQRCode {...{ invitation }} />
          ) : (
            <Skeleton width={160} height={160} />
          )}
          <Divider label="or" w="100%" maw={120} mx="auto" />
          <Center>
            {invitation ? (
              <SendInviteLinkButton {...{ invitation }} />
            ) : (
              <Skeleton radius="default">
                <Button>send invite link via...</Button>
              </Skeleton>
            )}
          </Center>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default WorldFriendInviteDrawer;
