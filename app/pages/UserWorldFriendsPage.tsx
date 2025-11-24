import { Text } from "@mantine/core";
import { groupBy, sortBy } from "lodash-es";
import MiniSearch from "minisearch";

import HideIcon from "~icons/heroicons/chevron-up-20-solid";
import EnvelopeIcon from "~icons/heroicons/envelope-20-solid";
import FrownyFaceIcon from "~icons/heroicons/face-frown-20-solid";
import CloseIcon from "~icons/heroicons/x-mark";

import AppLayout from "~/components/AppLayout";
import CreateInvitationButton from "~/components/CreateInvitationButton";
import UserWorldFriendCard from "~/components/UserWorldFriendCard";
import {
  useUserWorldActivities,
  useUserWorldFriends,
  worldManifestUrlForUser,
} from "~/helpers/userWorld";
import { type User, type UserWorldFriendProfile, type World } from "~/types";

import classes from "./UserWorldFriendsPage.module.css";

export interface WorldFriendsPageProps extends SharedPageProps {
  currentUser: User;
  world: World;
  pendingInvitationsCount: number;
}

const MIN_FRIENDS_FOR_SEARCH = 10;

const UserWorldFriendsPage: PageComponent<WorldFriendsPageProps> = ({
  world,
  pendingInvitationsCount,
}) => {
  const worldTheme = useWorldTheme(world.theme);

  // == MiniSearch
  const [miniSearch] = useState(
    () => new MiniSearch<UserWorldFriendProfile>({ fields: ["name", "emoji"] }),
  );
  const [miniSearchReady, setMiniSearchReady] = useState(false);
  const reindexMiniSearch = useCallback(
    (friends: UserWorldFriendProfile[]) => {
      setMiniSearchReady(false);
      miniSearch.removeAll();
      void miniSearch.addAllAsync(friends).then(() => {
        setMiniSearchReady(true);
      });
    },
    [miniSearch],
  );

  // == Load friends
  const { friends } = useUserWorldFriends({
    keepPreviousData: true,
    onSuccess: ({ friends }) => {
      reindexMiniSearch(friends);
    },
  });
  const friendsByNotifiability = useMemo(() => {
    const sortedFriends = sortBy(friends, friend =>
      friend.paused_since ? DateTime.fromISO(friend.paused_since) : null,
    );
    return groupBy(sortedFriends, "notifiable");
  }, [friends]);
  const friendsById = useMemo(() => keyBy(friends, "id"), [friends]);

  // == Load activities
  const { activities } = useUserWorldActivities({ keepPreviousData: true });
  const activitiesById = useMemo(() => keyBy(activities, "id"), [activities]);

  // == Search friends
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const displayedFriends = useMemo<UserWorldFriendProfile[]>(() => {
    if (!searchQuery.trim() || !miniSearchReady) {
      const {
        push: pushNotifiable = [],
        sms: smsNotifiable = [],
        false: notNotifiable = [],
      } = friendsByNotifiability;
      return [...pushNotifiable, ...smsNotifiable, ...notNotifiable];
    }
    const results: UserWorldFriendProfile[] = [];
    miniSearch
      .search(searchQuery, { prefix: true, fuzzy: 0.2 })
      .forEach(result => {
        invariant(typeof result.id === "string");
        const friend = friendsById[result.id];
        if (friend) {
          results.push(friend);
        }
      });
    return results;
  }, [
    friendsById,
    friendsByNotifiability,
    miniSearch,
    miniSearchReady,
    searchQuery,
  ]);
  return (
    <Stack gap="lg">
      <Stack gap={4} align="center">
        <Box component={FriendsIcon} fz="xl" />
        <Title size="h2" lh={1.2} ta="center">
          your friends
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
        <Stack gap={8}>
          <CreateInvitationButton
            variant="default"
            size="md"
            h="unset"
            py="md"
            onInvitationCreated={() => {
              router.reload({
                only: ["pendingInvitationsCount"],
                async: true,
              });
            }}
          />
          <Transition mounted={pendingInvitationsCount > 0}>
            {transitionStyle => (
              <Badge
                leftSection={<EnvelopeIcon />}
                mb="xs"
                style={[{ alignSelf: "center" }, transitionStyle]}
                {...(worldTheme === "bakudeku" && {
                  variant: "white",
                })}
              >
                <Anchor
                  component={Link}
                  href={routes.userWorldInvitations.index.path()}
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
        <Transition
          transition="fade"
          mounted={
            !!friends &&
            friends.length >= MIN_FRIENDS_FOR_SEARCH &&
            !searchActive
          }
          enterDelay={250}
        >
          {transitionStyle => (
            <Badge
              variant="default"
              className={classes.searchBadge}
              leftSection={<SearchIcon />}
              style={transitionStyle}
              onClick={() => {
                setSearchActive(true);
              }}
            >
              search friends
            </Badge>
          )}
        </Transition>
        <Transition
          transition="pop"
          mounted={
            !!friends &&
            friends.length >= MIN_FRIENDS_FOR_SEARCH &&
            searchActive
          }
          enterDelay={250}
        >
          {transitionStyle => (
            <TextInput
              ref={searchInputRef}
              inputContainer={children => (
                <>
                  {children}
                  <LoadingOverlay
                    visible={!miniSearchReady}
                    overlayProps={{ radius: "xl" }}
                  />
                </>
              )}
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
                            searchInputRef.current?.focus();
                          },
                        }
                      : {
                          onClick: () => {
                            setSearchActive(false);
                          },
                        })}
                  >
                    {searchQuery ? <CloseIcon /> : <HideIcon />}
                  </ActionIcon>
                </Tooltip>
              }
              placeholder="search your friends"
              autoFocus
              value={searchQuery}
              style={transitionStyle}
              onChange={({ currentTarget }) =>
                setSearchQuery(currentTarget.value)
              }
              onBlur={({ currentTarget }) => {
                if (currentTarget.value.trim() === "") {
                  setSearchActive(false);
                }
              }}
            />
          )}
        </Transition>
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
                <Text size="sm" fw={500}>
                  you world is too small (add a friend!)
                </Text>
              </Stack>
            </Card>
          ) : isEmpty(displayedFriends) ? (
            <EmptyCard itemLabel="results" />
          ) : (
            displayedFriends.map(friend => (
              <UserWorldFriendCard
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

UserWorldFriendsPage.layout = page => (
  <AppLayout<WorldFriendsPageProps>
    title="your friends"
    manifestUrl={({ currentUser }) => worldManifestUrlForUser(currentUser)}
    pwaScope={withTrailingSlash(routes.userWorld.show.path())}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default UserWorldFriendsPage;
