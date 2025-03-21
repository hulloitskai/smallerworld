import { Text } from "@mantine/core";
import { partition } from "lodash-es";

import FrownyFaceIcon from "~icons/heroicons/face-frown-20-solid";
import FriendsIcon from "~icons/heroicons/users-20-solid";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import FriendCard from "~/components/FriendCard";
import { type Friend, type User } from "~/types";

export interface FriendsPageProps extends SharedPageProps {
  currentUser: User;
}

const FriendsPage: PageComponent<FriendsPageProps> = () => {
  const { data } = useRouteSWR<{ friends: Friend[] }>(routes.friends.index, {
    descriptor: "load friends",
  });
  const { friends } = data ?? {};
  const [notifiableFriends, unnotifiableFriends] = useMemo(
    () => partition(friends, friend => friend.notifiable),
    [friends],
  );

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
        <AddFriendButton mih={60} size="md" />
        {friends ? (
          isEmpty(friends) ? (
            <Card
              withBorder
              c="dimmed"
              py="lg"
              style={{ borderStyle: "dashed" }}
            >
              <Stack align="center" gap={4}>
                <FrownyFaceIcon />
                <Text inherit>you world is too small (add a friend!)</Text>
              </Stack>
            </Card>
          ) : (
            [...notifiableFriends, ...unnotifiableFriends].map(friend => (
              <FriendCard key={friend.id} {...{ friend }} />
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

FriendsPage.layout = page => (
  <AppLayout<FriendsPageProps>
    title="your friends"
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

export default FriendsPage;
