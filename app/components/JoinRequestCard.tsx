import { type CardProps, CopyButton } from "@mantine/core";

import { type JoinRequest, type User } from "~/types";

import AddFriendButton from "./AddFriendButton";
import DeleteConfirmation from "./DeleteConfirmation";

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
}) => {
  const [deleteStarted, setDeleteStarted] = useState(false);
  const { trigger: triggerDelete } = useRouteMutation(
    routes.joinRequests.destroy,
    {
      params: {
        id: joinRequest.id,
      },
      descriptor: "remove join request",
      onSuccess: () => {
        void mutateRoute(routes.joinRequests.index);
      },
      onError: () => {
        setDeleteStarted(false);
      },
    },
  );

  return (
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
                  events={{ hover: true, focus: true, touch: true }}
                  position="right"
                  {...(copied && { opened: true })}
                >
                  <Anchor onClick={copy}>{joinRequest.phone_number}</Anchor>
                </Tooltip>
              )}
            </CopyButton>
          </List.Item>
        </List>
        <Stack gap={4}>
          <AddFriendButton {...{ currentUser }} fromJoinRequest={joinRequest} />
          <DeleteConfirmation
            label="really dismiss?"
            onConfirm={() => {
              setDeleteStarted(true);
              void triggerDelete();
            }}
          >
            <Anchor component="button" size="xs" c="red" inline>
              dismiss join request
            </Anchor>
          </DeleteConfirmation>
        </Stack>
      </Group>
      <Badge className={classes.timestampBadge} variant="default">
        <Time format={DateTime.DATETIME_MED} inline inherit>
          {joinRequest.created_at}
        </Time>
      </Badge>
      <LoadingOverlay visible={deleteStarted} />
    </Card>
  );
};

export default JoinRequestCard;
