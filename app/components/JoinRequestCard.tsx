import { type CardProps, CopyButton } from "@mantine/core";

import { type JoinRequest } from "~/types";

import AddFriendButton from "./AddFriendButton";

import classes from "./JoinRequestCard.module.css";

interface JoinRequestCardProps extends CardProps {
  joinRequest: JoinRequest;
}

const JoinRequestCard: FC<JoinRequestCardProps> = ({
  joinRequest,
  ...otherProps
}) => (
  <Card withBorder pb="sm" {...otherProps}>
    <Card.Section inheritPadding py={8}>
      <Group justify="end">
        <Time
          format={DateTime.DATETIME_MED}
          size="xs"
          inline
          className={classes.timestamp}
          display="block"
        >
          {joinRequest.created_at}
        </Time>
      </Group>
    </Card.Section>
    <Group align="center" gap="xs" justify="space-between">
      <List className={classes.list}>
        <List.Item icon={<UserIcon />}>{joinRequest.name}</List.Item>
        <List.Item icon={<PhoneIcon />}>
          <CopyButton value={joinRequest.phone_number}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "copied" : "copy"}>
                <Anchor onClick={copy}>{joinRequest.phone_number}</Anchor>
              </Tooltip>
            )}
          </CopyButton>
        </List.Item>
      </List>
      <AddFriendButton fromJoinRequest={joinRequest} />
    </Group>
  </Card>
);

export default JoinRequestCard;
