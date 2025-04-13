import { type CardProps, CopyButton } from "@mantine/core";

import { type JoinRequest, type User } from "~/types";

import AddFriendButton from "./AddFriendButton";

import classes from "./JoinRequestCard.module.css";

interface JoinRequestCardProps extends CardProps {
  currentUser: User;
  joinRequest: JoinRequest;
}

const JoinRequestCard: FC<JoinRequestCardProps> = ({
  currentUser,
  joinRequest,
  className,
  ...otherProps
}) => (
  <Card
    className={cn("JoinRequestCard", className, classes.card)}
    withBorder
    {...otherProps}
  >
    <Group align="center" gap="xs" justify="space-between">
      <List className={classes.list}>
        <List.Item icon={<UserIcon />} fw={600}>
          {joinRequest.name}
        </List.Item>
        <List.Item icon={<PhoneIcon />}>
          <CopyButton value={joinRequest.phone_number}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "copied!" : "copy?"}
                position="right"
                {...(copied && { opened: true })}
              >
                <Anchor onClick={copy}>{joinRequest.phone_number}</Anchor>
              </Tooltip>
            )}
          </CopyButton>
        </List.Item>
      </List>
      <AddFriendButton {...{ currentUser }} fromJoinRequest={joinRequest} />
    </Group>
    <Badge className={classes.timestampBadge} variant="default">
      <Time format={DateTime.DATETIME_MED} inline inherit>
        {joinRequest.created_at}
      </Time>
    </Badge>
  </Card>
);

export default JoinRequestCard;
