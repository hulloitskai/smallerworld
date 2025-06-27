import { type CardProps, CopyButton } from "@mantine/core";

import { type JoinedUser } from "~/types";

import AddFriendButton, { type AddFriendButtonProps } from "./AddFriendButton";

import classes from "./JoinRequestCard.module.css";

interface JoinedUserCardProps
  extends CardProps,
    Pick<AddFriendButtonProps, "currentUser"> {
  user: JoinedUser;
}

const JoinedUserCard: FC<JoinedUserCardProps> = ({
  currentUser,
  user,
  ...otherProps
}) => (
  <Card withBorder pb="sm" {...otherProps}>
    <Group align="center" gap="xs" justify="space-between">
      <List className={classes.list}>
        <List.Item icon={<UserIcon />}>
          <Anchor
            href={routes.users.show.path({
              id: user.handle,
              query: {
                friend_token: user.friend_access_token,
              },
            })}
            target="_blank"
            fw={600}
          >
            {user.name}
          </Anchor>
        </List.Item>
        <List.Item icon={<PhoneIcon />}>
          <CopyButton value={user.phone_number}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "copied!" : "copy?"}
                events={{ hover: true, focus: true, touch: true }}
                position="right"
                {...(copied && { opened: true })}
              >
                <Anchor onClick={copy}>{user.phone_number}</Anchor>
              </Tooltip>
            )}
          </CopyButton>
        </List.Item>
      </List>
      {user.friended ? (
        <Button
          component="a"
          href={routes.users.show.path({
            id: user.handle,
            ...(user.friend_access_token && {
              query: {
                friend_token: user.friend_access_token,
              },
            }),
          })}
          target="_blank"
          // leftSection={<SmallerWorldIcon />}
        >
          visit world
        </Button>
      ) : (
        <AddFriendButton {...{ currentUser }} fromUser={user} />
      )}
    </Group>
  </Card>
);

export default JoinedUserCard;
