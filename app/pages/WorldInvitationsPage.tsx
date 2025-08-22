import AppLayout from "~/components/AppLayout";
import CreateInvitationButton from "~/components/CreateInvitationButton";
import WorldInvitationCard from "~/components/WorldInvitationCard";
import { useWorldActivities } from "~/helpers/world";
import { type User, type WorldInvitation } from "~/types";

export interface WorldInvitationsPageProps extends SharedPageProps {
  currentUser: User;
}

const WorldInvitationsPage: PageComponent<WorldInvitationsPageProps> = ({
  currentUser,
}) => {
  // == User theme
  useUserTheme(currentUser.theme);

  // == Load invitations
  const { data } = useRouteSWR<{ pendingInvitations: WorldInvitation[] }>(
    routes.worldInvitations.index,
    {
      descriptor: "load pending invitations",
    },
  );
  const { pendingInvitations } = data ?? {};

  // == Load activities
  const { activities } = useWorldActivities({ keepPreviousData: true });
  const activitiesById = useMemo(() => keyBy(activities, "id"), [activities]);

  return (
    <Stack gap="lg">
      <Stack gap={4} align="center" ta="center">
        <Box component={InvitationIcon} fz="xl" />
        <Title size="h2">recently sent invitations</Title>
        <Button
          component={Link}
          leftSection={<BackIcon />}
          radius="xl"
          href={routes.worldFriends.index.path()}
          mt={2}
        >
          back to your friends
        </Button>
      </Stack>
      <Stack gap="xs">
        <CreateInvitationButton variant="default" size="md" h="unset" py="sm" />
        {pendingInvitations ? (
          isEmpty(pendingInvitations) ? (
            <EmptyCard itemLabel="join requests" />
          ) : (
            pendingInvitations.map(invitation => (
              <WorldInvitationCard
                key={invitation.id}
                {...{ activitiesById, invitation }}
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

WorldInvitationsPage.layout = page => (
  <AppLayout<WorldInvitationsPageProps>
    title="your pending invitations"
    manifestUrl={routes.world.manifest.path()}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default WorldInvitationsPage;
