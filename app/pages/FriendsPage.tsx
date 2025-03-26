import { Text } from "@mantine/core";
import { partition } from "lodash-es";

import FrownyFaceIcon from "~icons/heroicons/face-frown-20-solid";
import FriendsIcon from "~icons/heroicons/users-20-solid";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import FriendCard from "~/components/FriendCard";
import SuggestedFriendCard from "~/components/SuggestedFriendCard";
import { type FriendView, type SuggestedFriend, type User } from "~/types";

export interface FriendsPageProps extends SharedPageProps {
  currentUser: User;
}

const FriendsPage: PageComponent<FriendsPageProps> = () => {
  const isStandalone = useIsStandalone();

  // == Load friends
  const { data: friendsData } = useRouteSWR<{ friends: FriendView[] }>(
    routes.friends.index,
    {
      descriptor: "load friends",
    },
  );
  const { friends } = friendsData ?? {};
  const [notifiableFriends, unnotifiableFriends] = useMemo(
    () => partition(friends, friend => friend.notifiable),
    [friends],
  );

  // == Load suggested friends
  const { data: suggestedFriendsData } = useRouteSWR<{
    suggestedFriends: SuggestedFriend[];
  }>(routes.friends.suggested, {
    descriptor: "load suggested friends",
  });
  const { suggestedFriends } = suggestedFriendsData ?? {};

  return (
    <Stack gap="xl">
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
      {isStandalone && !!suggestedFriends && !isEmpty(suggestedFriends) && (
        <Stack gap="sm">
          <Group gap="xs" justify="center">
            <Title order={2} size="h3">
              suggested friends
            </Title>
            <Badge>beta</Badge>
          </Group>
          <Stack gap="xs">
            {suggestedFriends.map(suggestedFriend => (
              <SuggestedFriendCard
                key={suggestedFriend.id}
                {...{ suggestedFriend }}
              />
            ))}
          </Stack>
        </Stack>
      )}
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
