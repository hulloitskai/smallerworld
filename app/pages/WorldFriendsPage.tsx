import { Text } from "@mantine/core";

import EnvelopeIcon from "~icons/heroicons/envelope-20-solid";
import FrownyFaceIcon from "~icons/heroicons/face-frown-20-solid";
import FriendsIcon from "~icons/heroicons/users-20-solid";

import AppLayout from "~/components/AppLayout";
import CreateInvitationButton from "~/components/CreateInvitationButton";
import WorldFriendCard from "~/components/WorldFriendCard";
import { useWorldActivities, useWorldFriends } from "~/helpers/world";
import { type User } from "~/types";

export interface WorldFriendsPageProps extends SharedPageProps {
  currentUser: User;
  pendingInvitationsCount: number;
}

const WorldFriendsPage: PageComponent<WorldFriendsPageProps> = ({
  currentUser,
  pendingInvitationsCount,
}) => {
  // == User theme
  useUserTheme(currentUser.theme);

  // == Load friends
  const { allFriends, notifiableFriends, unnotifiableFriends } =
    useWorldFriends({ keepPreviousData: true });

  // == Load activities
  const { activities } = useWorldActivities({ keepPreviousData: true });
  const activitiesById = useMemo(() => keyBy(activities, "id"), [activities]);

  return (
    <Stack gap="lg">
      <Stack gap={4} align="center">
        <Box component={FriendsIcon} fz="xl" />
        <Title size="h2" ta="center">
          your friends
        </Title>
        <Button
          component={Link}
          leftSection={<BackIcon />}
          radius="xl"
          href={routes.world.show.path()}
        >
          back to your world
        </Button>
      </Stack>
      <Stack gap="xs">
        <Stack gap={8}>
          <CreateInvitationButton
            variant="default"
            size="md"
            h="unset"
            py="sm"
            onInvitationCreated={() => {
              router.reload({
                only: ["pendingInvitationsCount"],
                async: true,
              });
            }}
          />
          <Transition mounted={pendingInvitationsCount > 0}>
            {style => (
              <Badge
                leftSection={<EnvelopeIcon />}
                mb="xs"
                style={{ alignSelf: "center", ...style }}
              >
                <Anchor
                  component={Link}
                  href={routes.worldInvitations.index.path()}
                  inherit
                  c="inherit"
                >
                  {pendingInvitationsCount} recently sent{" "}
                  {inflect("invitations", pendingInvitationsCount)}
                </Anchor>
              </Badge>
            )}
          </Transition>
        </Stack>
        {allFriends ? (
          isEmpty(allFriends) ? (
            <Card
              withBorder
              c="dimmed"
              py="lg"
              style={{ borderStyle: "dashed" }}
            >
              <Stack align="center" gap={4}>
                <FrownyFaceIcon />
                <Text size="sm" fw={500}>
                  you world is too small (add a friend!)
                </Text>
              </Stack>
            </Card>
          ) : (
            [...notifiableFriends, ...unnotifiableFriends].map(friend => (
              <WorldFriendCard
                key={friend.id}
                {...{ activitiesById, friend }}
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

WorldFriendsPage.layout = page => (
  <AppLayout<WorldFriendsPageProps>
    title="your friends"
    manifestUrl={routes.world.manifest.path()}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default WorldFriendsPage;
