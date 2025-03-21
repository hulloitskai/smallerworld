import { CopyButton } from "@mantine/core";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import { type JoinRequest, type User } from "~/types";

import classes from "./JoinRequestsPage.module.css";

export interface JoinRequestsPageProps extends SharedPageProps {
  currentUser: User;
}

const JoinRequestsPage: PageComponent<JoinRequestsPageProps> = () => {
  const { data } = useRouteSWR<{ joinRequests: JoinRequest[] }>(
    routes.joinRequests.index,
    {
      descriptor: "load join requests",
    },
  );
  const { joinRequests } = data ?? {};

  return (
    <Stack gap="lg">
      <Stack gap={4} align="center" ta="center">
        <Box component={JoinRequestsIcon} fz="xl" />
        <Title size="h2">your join requests</Title>
        <Button
          component={Link}
          leftSection={<BackIcon />}
          radius="xl"
          href={routes.world.show.path()}
          mt={2}
        >
          back to your world
        </Button>
      </Stack>
      <Stack gap="xs">
        {joinRequests ? (
          isEmpty(joinRequests) ? (
            <EmptyCard itemLabel="join requests" />
          ) : (
            joinRequests.map(joinRequest => (
              <JoinRequestCard key={joinRequest.id} {...{ joinRequest }} />
            ))
          )
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          [...new Array(3)].map((_, i) => <Skeleton key={i} h={96} />)
        )}
      </Stack>
    </Stack>
  );
};

JoinRequestsPage.layout = page => (
  <AppLayout<JoinRequestsPageProps>
    title="your join requests"
    manifestUrl={({ currentUser }) =>
      routes.users.manifest.path({ id: currentUser.id })
    }
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default JoinRequestsPage;

interface JoinRequestCardProps {
  joinRequest: JoinRequest;
}

const JoinRequestCard: FC<JoinRequestCardProps> = ({ joinRequest }) => {
  return (
    <Card withBorder>
      <Card.Section inheritPadding py={8}>
        <Group justify="center">
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
        <List className={classes.cardList}>
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
};
