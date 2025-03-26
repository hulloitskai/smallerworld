import { type CardProps, CopyButton } from "@mantine/core";

import { type JoinedUser } from "~/types";

import AddFriendButton from "./AddFriendButton";

import classes from "./JoinRequestCard.module.css";

interface JoinedUserCardProps extends CardProps {
  user: JoinedUser;
}

const JoinedUserCard: FC<JoinedUserCardProps> = ({ user, ...otherProps }) => (
  <Card withBorder pb="sm" {...otherProps}>
    <Group align="center" gap="xs" justify="space-between">
      <List className={classes.list}>
        <List.Item icon={<UserIcon />}>
          <Anchor
            href={routes.users.show.path({
              handle: user.handle,
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
              <Tooltip label={copied ? "copied!" : "copy?"} position="right">
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
            handle: user.handle,
            ...(user.friend_access_token && {
              query: {
                friend_token: user.friend_access_token,
              },
            }),
          })}
          target="_blank"
          leftSection={<SmallerWorldIcon />}
        >
          visit world
        </Button>
      ) : (
        <AddFriendButton fromUser={user} />
      )}
    </Group>
  </Card>
);

export default JoinedUserCard;
