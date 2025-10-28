import AppLayout from "~/components/AppLayout";
import CreateInvitationDrawer from "~/components/CreateInvitationDrawer";
import WorldJoinRequestCard from "~/components/WorldJoinRequestCard";
import { type JoinRequest, type User } from "~/types";

export interface WorldJoinRequestsPageProps extends SharedPageProps {
  currentUser: User;
}

const WorldJoinRequestsPage: PageComponent<WorldJoinRequestsPageProps> = ({
  currentUser,
}) => {
  // == User theme
  const theme = useUserTheme(currentUser.theme);

  // == Load join requests
  const { data } = useRouteSWR<{ pendingJoinRequests: JoinRequest[] }>(
    routes.worldJoinRequests.index,
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
            href={withTrailingSlash(routes.world.show.path())}
            mt={4}
            {...(theme === "bakudeku" && {
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
                <WorldJoinRequestCard
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

WorldJoinRequestsPage.layout = page => (
  <AppLayout<WorldJoinRequestsPageProps>
    title="your join requests"
    manifestUrl={routes.world.manifest.path()}
    pwaScope={withTrailingSlash(routes.world.show.path())}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default WorldJoinRequestsPage;
