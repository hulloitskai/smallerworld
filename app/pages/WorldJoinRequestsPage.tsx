import AppLayout from "~/components/AppLayout";
import WorldJoinRequestCard from "~/components/WorldJoinRequestCard";
import { type JoinRequest, type User } from "~/types";

export interface WorldJoinRequestsPageProps extends SharedPageProps {
  currentUser: User;
}

const WorldJoinRequestsPage: PageComponent<WorldJoinRequestsPageProps> = ({
  currentUser,
}) => {
  // == User theme
  useUserTheme(currentUser.theme);

  // == Load join requests
  const { data } = useRouteSWR<{ pendingJoinRequests: JoinRequest[] }>(
    routes.worldJoinRequests.index,
    {
      descriptor: "load join requests",
    },
  );
  const { pendingJoinRequests } = data ?? {};

  return (
    <Stack gap="lg">
      <Stack gap={4} align="center" ta="center">
        <Box component={JoinRequestIcon} fz="xl" />
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
        {pendingJoinRequests ? (
          isEmpty(pendingJoinRequests) ? (
            <EmptyCard itemLabel="join requests" />
          ) : (
            pendingJoinRequests.map(joinRequest => (
              <WorldJoinRequestCard key={joinRequest.id} {...{ joinRequest }} />
            ))
          )
        ) : (
          [...new Array(3)].map((_, i) => <Skeleton key={i} h={96} />)
        )}
      </Stack>
    </Stack>
  );
};

WorldJoinRequestsPage.layout = page => (
  <AppLayout<WorldJoinRequestsPageProps>
    title="your join requests"
    manifestUrl={routes.world.manifest.path()}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default WorldJoinRequestsPage;
