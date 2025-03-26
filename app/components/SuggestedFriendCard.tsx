import { type CardProps, CopyButton } from "@mantine/core";

import { type SuggestedFriend } from "~/types";

import AddFriendButton from "./AddFriendButton";

import classes from "./JoinRequestCard.module.css";

interface SuggestedFriendCardProps extends CardProps {
  suggestedFriend: SuggestedFriend;
}

const SuggestedFriendCard: FC<SuggestedFriendCardProps> = ({
  suggestedFriend,
  ...otherProps
}) => (
  <Card withBorder pb="sm" {...otherProps}>
    <Group align="center" gap="xs" justify="space-between">
      <List className={classes.list}>
        <List.Item icon={<UserIcon />} fw={600}>
          {suggestedFriend.name}
        </List.Item>
        <List.Item icon={<PhoneIcon />}>
          <CopyButton value={suggestedFriend.phone_number}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "copied!" : "copy?"} position="right">
                <Anchor onClick={copy}>{suggestedFriend.phone_number}</Anchor>
              </Tooltip>
            )}
          </CopyButton>
        </List.Item>
      </List>
      <AddFriendButton fromSuggestedFriend={suggestedFriend} />
    </Group>
  </Card>
);

export default SuggestedFriendCard;
