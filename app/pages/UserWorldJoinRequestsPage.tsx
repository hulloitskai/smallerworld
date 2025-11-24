import AppLayout from "~/components/AppLayout";
import CreateInvitationDrawer from "~/components/CreateInvitationDrawer";
import UserWorldJoinRequestCard from "~/components/UserWorldJoinRequestCard";
import { worldManifestUrlForUser } from "~/helpers/userWorld";
import { type JoinRequest, type User, type World } from "~/types";

export interface UserWorldJoinRequestsPageProps extends SharedPageProps {
  currentUser: User;
  world: World;
}

const UserWorldJoinRequestsPage: PageComponent<
  UserWorldJoinRequestsPageProps
> = ({ world }) => {
  const worldTheme = useWorldTheme(world.theme);

  // == Load join requests
  const { data } = useRouteSWR<{ pendingJoinRequests: JoinRequest[] }>(
    routes.userWorldJoinRequests.index,
    {
      descriptor: "load join requests",
      keepPreviousData: true,
    },
  );
  const { pendingJoinRequests } = data ?? {};

  // == Create invitation from join request
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [toInviteFromJoinRequest, setToInviteFromJoinRequest] =
    useState<JoinRequest | null>(null);

  return (
    <>
      <Stack gap="lg">
        <Stack gap={4} align="center">
          <Box component={JoinRequestIcon} fz="xl" />
          <Title size="h2" lh={1.2} ta="center">
            your join requests
          </Title>
          <Button
            component={Link}
            leftSection={<BackIcon />}
            radius="xl"
            href={withTrailingSlash(routes.userWorld.show.path())}
            mt={4}
            {...(worldTheme === "bakudeku" && {
              variant: "filled",
            })}
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
                <UserWorldJoinRequestCard
                  key={joinRequest.id}
                  {...{ joinRequest }}
                  onSelectForInvitation={() => {
                    setToInviteFromJoinRequest(joinRequest);
                    setDrawerOpened(true);
                  }}
                />
              ))
            )
          ) : (
            [...new Array(3)].map((_, i) => <Skeleton key={i} h={96} />)
          )}
        </Stack>
      </Stack>
      {toInviteFromJoinRequest && (
        <CreateInvitationDrawer
          fromJoinRequest={toInviteFromJoinRequest}
          opened={drawerOpened}
          onClose={() => {
            setDrawerOpened(false);
          }}
        />
      )}
    </>
  );
};

UserWorldJoinRequestsPage.layout = page => (
  <AppLayout<UserWorldJoinRequestsPageProps>
    title="your join requests"
    manifestUrl={({ currentUser }) => worldManifestUrlForUser(currentUser)}
    pwaScope={withTrailingSlash(routes.userWorld.show.path())}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default UserWorldJoinRequestsPage;
