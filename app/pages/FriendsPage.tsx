import { Text } from "@mantine/core";
import { partition } from "lodash-es";

import HideIcon from "~icons/heroicons/chevron-up-20-solid";
import FrownyFaceIcon from "~icons/heroicons/face-frown-20-solid";
import SearchIcon from "~icons/heroicons/magnifying-glass-20-solid";
import FriendsIcon from "~icons/heroicons/users-20-solid";
import CloseIcon from "~icons/heroicons/x-mark";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import NotifiableFriendCard from "~/components/NotifiableFriendCard";
import { prettyName } from "~/helpers/friends";
import {
  type Activity,
  type ActivityTemplate,
  type NotifiableFriend,
  type User,
} from "~/types";

export interface FriendsPageProps extends SharedPageProps {
  currentUser: User;
}

const FriendsPage: PageComponent<FriendsPageProps> = ({ currentUser }) => {
  // == User theme
  useUserTheme(currentUser.theme);

  // == Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // == Load friends
  const { data: friendsData } = useRouteSWR<{ friends: NotifiableFriend[] }>(
    routes.friends.index,
    {
      descriptor: "load friends",
      keepPreviousData: true,
    },
  );
  const { friends } = friendsData ?? {};

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!friends || !searchQuery) return friends;

    const query = searchQuery.toLowerCase();
    return friends.filter(friend => {
      const friendName = prettyName(friend).toLowerCase();
      return friendName.includes(query);
    });
  }, [friends, searchQuery]);

  const [notifiableFriends, unnotifiableFriends] = useMemo(
    () => partition(filteredFriends, friend => friend.notifiable),
    [filteredFriends],
  );

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
        <Group gap={8} justify="center">
          <Button
            component={Link}
            leftSection={<BackIcon />}
            radius="xl"
            href={routes.world.show.path()}
          >
            back to your world
          </Button>
          <Transition
            transition="slide-up"
            mounted={!showSearch && !!friends && friends.length > 0}
          >
            {style => (
              <ActionIcon
                size="lg"
                variant="light"
                {...{ style }}
                onClick={() => {
                  setShowSearch(true);
                }}
              >
                <SearchIcon />
              </ActionIcon>
            )}
          </Transition>
        </Group>
      </Stack>
      <Stack gap="xs">
        <Transition transition="slide-down" mounted={showSearch}>
          {style => (
            <TextInput
              ref={inputRef}
              leftSection={<SearchIcon />}
              rightSection={
                <Tooltip
                  label={searchQuery ? "clear search" : "hide search"}
                  openDelay={600}
                >
                  <ActionIcon
                    {...(searchQuery
                      ? {
                          color: "red",
                          onClick: () => {
                            setSearchQuery("");
                            inputRef.current?.focus();
                          },
                        }
                      : {
                          onClick: () => {
                            setShowSearch(false);
                            setSearchQuery("");
                          },
                        })}
                    {...{ style }}
                  >
                    {searchQuery ? <CloseIcon /> : <HideIcon />}
                  </ActionIcon>
                </Tooltip>
              }
              placeholder="search your friends"
              value={searchQuery}
              onChange={({ currentTarget }) =>
                setSearchQuery(currentTarget.value)
              }
              onBlur={({ currentTarget }) => {
                if (currentTarget.value === "") {
                  setShowSearch(false);
                }
              }}
              autoFocus
              {...{ style }}
            />
          )}
        </Transition>
        <AddFriendButton {...{ currentUser }} size="md" mih={54} />
        {friends ? (
          isEmpty(filteredFriends) ? (
            searchQuery ? (
              <Card
                withBorder
                c="dimmed"
                py="lg"
                style={{ borderStyle: "dashed" }}
              >
                <Stack align="center" gap={4}>
                  <SearchIcon />
                  <Text size="sm" fw={500}>
                    no friends match "{searchQuery}"
                  </Text>
                </Stack>
              </Card>
            ) : (
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
            )
          ) : (
            [...notifiableFriends, ...unnotifiableFriends].map(friend => (
              <NotifiableFriendCard
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
