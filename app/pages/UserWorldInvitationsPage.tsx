import AppLayout from "~/components/AppLayout";
import CreateInvitationButton from "~/components/CreateInvitationButton";
import UserWorldInvitationCard from "~/components/UserWorldInvitationCard";
import {
  useUserWorldActivities,
  worldManifestUrlForUser,
} from "~/helpers/userWorld";
import { useWorldTheme } from "~/helpers/worldThemes";
import { type User, type UserWorldInvitation, type World } from "~/types";

export interface UserWorldInvitationsPageProps extends SharedPageProps {
  currentUser: User;
  world: World;
  hasFriends: boolean;
}

const UserWorldInvitationsPage: PageComponent<
  UserWorldInvitationsPageProps
> = ({ world, hasFriends }) => {
  const worldTheme = useWorldTheme(world.theme);

  // == Load invitations
  const { data } = useRouteSWR<{ pendingInvitations: UserWorldInvitation[] }>(
    routes.userWorldInvitations.index,
    {
      descriptor: "load pending invitations",
      keepPreviousData: true,
    },
  );
  const { pendingInvitations } = data ?? {};

  // == Load activities
  const { activities } = useUserWorldActivities({ keepPreviousData: true });
  const activitiesById = useMemo(() => keyBy(activities, "id"), [activities]);

  return (
    <Stack gap="lg">
      <Stack gap={4} align="center">
        <Box component={InvitationIcon} fz="xl" />
        <Title size="h2" lh={1.2} ta="center">
          recently sent invitations
        </Title>
        <Button
          component={Link}
          leftSection={<BackIcon />}
          radius="xl"
          href={
            hasFriends
              ? routes.userWorldFriends.index.path()
              : withTrailingSlash(routes.userWorld.show.path())
          }
          mt={4}
          {...(worldTheme === "bakudeku" && {
            variant: "filled",
          })}
        >
          back to your {hasFriends ? "friends" : "world"}
        </Button>
      </Stack>
      <Stack gap="xs">
        <CreateInvitationButton variant="default" size="md" h="unset" py="md" />
        {pendingInvitations ? (
          isEmpty(pendingInvitations) ? (
            <EmptyCard itemLabel="join requests" />
          ) : (
            pendingInvitations.map(invitation => (
              <UserWorldInvitationCard
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

UserWorldInvitationsPage.layout = page => (
  <AppLayout<UserWorldInvitationsPageProps>
    title="your pending invitations"
    manifestUrl={({ currentUser }) => worldManifestUrlForUser(currentUser)}
    pwaScope={withTrailingSlash(routes.userWorld.show.path())}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default UserWorldInvitationsPage;
