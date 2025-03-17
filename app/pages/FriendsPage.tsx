import { Text } from "@mantine/core";

import FrownyFaceIcon from "~icons/heroicons/face-frown-20-solid";
import FriendsIcon from "~icons/heroicons/users-20-solid";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import FriendCard from "~/components/FriendCard";
import { type Friend } from "~/types";

export interface FriendsPageProps extends SharedPageProps {}

const FriendsPage: PageComponent<FriendsPageProps> = () => {
  const { data } = useRouteSWR<{ friends: Friend[] }>(routes.friends.index, {
    descriptor: "load friends",
  });
  const { friends } = data ?? {};

  return (
    <Stack>
      <Stack gap={4} align="center" ta="center">
        <Box component={FriendsIcon} fz="xl" />
        <Title size="h2">your friends</Title>
        <Button
          component={Link}
          leftSection={<BackIcon />}
          radius="xl"
          href={routes.home.show.path()}
        >
          back to home
        </Button>
      </Stack>
      <Stack gap="xs">
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
            friends.map(friend => (
              <FriendCard key={friend.id} {...{ friend }} />
            ))
          )
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          [...new Array(3)].map((_, i) => <Skeleton key={i} h={96} />)
        )}
        <AddFriendButton />
      </Stack>
    </Stack>
  );
};

FriendsPage.layout = page => (
  <AppLayout<FriendsPageProps> withContainer containerSize="xs" withGutter>
    {page}
  </AppLayout>
);

export default FriendsPage;
