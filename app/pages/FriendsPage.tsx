import { Text } from "@mantine/core";

import FrownyFaceIcon from "~icons/heroicons/face-frown-20-solid";
import FriendsIcon from "~icons/heroicons/users-20-solid";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import FriendCard from "~/components/FriendCard";
import { useFriends } from "~/helpers/friends";
import { type Activity, type ActivityTemplate, type User } from "~/types";

export interface FriendsPageProps extends SharedPageProps {
  currentUser: User;
}

const FriendsPage: PageComponent<FriendsPageProps> = ({ currentUser }) => {
  // == User theme
  useUserTheme(currentUser.theme);

  // == Load friends
  const { allFriends, notifiableFriends, unnotifiableFriends } = useFriends();

  // == Load activities
  const { data: activitiesData } = useRouteSWR<{
    activities: Activity[];
    activityTemplates: ActivityTemplate[];
  }>(routes.activities.index, {
    descriptor: "load activities",
  });
  const { activities } = activitiesData ?? {};
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
          mt={2}
        >
          back to your world
        </Button>
      </Stack>
      <Stack gap="xs">
        <AddFriendButton {...{ currentUser }} size="md" mih={54} />
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
              <FriendCard
                key={friend.id}
                {...{ activitiesById, currentUser, friend }}
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

FriendsPage.layout = page => (
  <AppLayout<FriendsPageProps>
    title="your friends"
    manifestUrl={routes.world.manifest.path()}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default FriendsPage;
