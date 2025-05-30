import AppLayout from "~/components/AppLayout";
import JoinRequestCard from "~/components/JoinRequestCard";
import { type JoinRequest, type User } from "~/types";

export interface JoinRequestsPageProps extends SharedPageProps {
  currentUser: User;
}

const JoinRequestsPage: PageComponent<JoinRequestsPageProps> = ({
  currentUser,
}) => {
  // == User theme
  useUserTheme(currentUser.theme);

  // == Load join requests
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
              <JoinRequestCard
                key={joinRequest.id}
                {...{ currentUser, joinRequest }}
              />
            ))
          )
        ) : (
          [...new Array(3)].map((_, i) => <Skeleton key={i} h={96} />)
        )}
      </Stack>
    </Stack>
  );
};

JoinRequestsPage.layout = page => (
  <AppLayout<JoinRequestsPageProps>
    title="your join requests"
    manifestUrl={routes.world.manifest.path()}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default JoinRequestsPage;
