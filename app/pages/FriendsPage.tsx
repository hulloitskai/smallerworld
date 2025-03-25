import { Text } from "@mantine/core";
import { partition } from "lodash-es";

import AtIcon from "~icons/heroicons/at-symbol-20-solid";
import FrownyFaceIcon from "~icons/heroicons/face-frown-20-solid";
import FriendsIcon from "~icons/heroicons/users-20-solid";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import FriendCard from "~/components/FriendCard";
import { queryInstalledUserHandles } from "~/helpers/serviceWorker";
import { type FriendView, type User } from "~/types";

export interface FriendsPageProps extends SharedPageProps {
  currentUser: User;
  showInstalledUsers: boolean;
}

const FriendsPage: PageComponent<FriendsPageProps> = ({
  showInstalledUsers,
}) => {
  const isStandalone = useIsStandalone();

  // == Load friends
  const { data } = useRouteSWR<{ friends: FriendView[] }>(
    routes.friends.index,
    {
      descriptor: "load friends",
    },
  );
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
      {showInstalledUsers && isStandalone && <InstalledUsersCard />}
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

const InstalledUsersCard: FC = () => {
  const [userHandles, setUserHandles] = useState<string[] | undefined>();
  useEffect(() => {
    void queryInstalledUserHandles().then(setUserHandles, error => {
      console.error("failed to lookup installed user apps", error);
      if (error instanceof Error) {
        toast.error("failed to lookup installed user apps", {
          description: error.message,
        });
      }
    });
  }, []);

  return (
    <Stack gap={6}>
      <Title order={2} size="h4">
        installed user apps
      </Title>
      {userHandles ? (
        isEmpty(userHandles) ? (
          <Text size="xs" c="dimmed">
            No installed user apps
          </Text>
        ) : (
          <Group wrap="wrap">
            {userHandles.map(handle => (
              <Badge
                key={handle}
                size="lg"
                leftSection={<AtIcon />}
                styles={{ label: { textTransform: "none" } }}
              >
                {handle}
              </Badge>
            ))}
          </Group>
        )
      ) : (
        <Skeleton h={72} />
      )}
    </Stack>
  );
};
