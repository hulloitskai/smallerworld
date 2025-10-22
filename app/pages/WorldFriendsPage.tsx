import { Text } from "@mantine/core";
import MiniSearch from "minisearch";

import HideIcon from "~icons/heroicons/chevron-up-20-solid";
import EnvelopeIcon from "~icons/heroicons/envelope-20-solid";
import FrownyFaceIcon from "~icons/heroicons/face-frown-20-solid";
import FriendsIcon from "~icons/heroicons/users-20-solid";
import CloseIcon from "~icons/heroicons/x-mark";

import AppLayout from "~/components/AppLayout";
import CreateInvitationButton from "~/components/CreateInvitationButton";
import WorldFriendCard from "~/components/WorldFriendCard";
import { addTrailingSlash } from "~/helpers/utils";
import {
  useFriendsByNotifiable,
  useWorldActivities,
  useWorldFriends,
} from "~/helpers/world";
import { type User, type WorldFriend } from "~/types";

import classes from "./WorldFriendsPage.module.css";

export interface WorldFriendsPageProps extends SharedPageProps {
  currentUser: User;
  pendingInvitationsCount: number;
}

const MIN_FRIENDS_FOR_SEARCH = 10;

const WorldFriendsPage: PageComponent<WorldFriendsPageProps> = ({
  currentUser,
  pendingInvitationsCount,
}) => {
  // == User theme
  useUserTheme(currentUser.theme);

  // == MiniSearch
  const [miniSearch] = useState(
    () => new MiniSearch<WorldFriend>({ fields: ["name", "emoji"] }),
  );
  const [miniSearchReady, setMiniSearchReady] = useState(false);
  const reindexMiniSearch = useCallback(
    (friends: WorldFriend[]) => {
      setMiniSearchReady(false);
      miniSearch.removeAll();
      void miniSearch.addAllAsync(friends).then(() => {
        setMiniSearchReady(true);
      });
    },
    [miniSearch],
  );

  // == Load friends
  const { allFriends } = useWorldFriends({
    keepPreviousData: true,
    onSuccess: ({ friends }) => {
      reindexMiniSearch(friends);
    },
  });
  const friendsByNotifiable = useFriendsByNotifiable(allFriends);
  const friendsById = useMemo(() => keyBy(allFriends, "id"), [allFriends]);

  // == Load activities
  const { activities } = useWorldActivities({ keepPreviousData: true });
  const activitiesById = useMemo(() => keyBy(activities, "id"), [activities]);

  // == Search friends
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const displayedFriends = useMemo<WorldFriend[]>(() => {
    if (!searchQuery.trim() || !miniSearchReady) {
      const {
        push: pushNotifiable = [],
        sms: smsNotifiable = [],
        false: notNotifiable = [],
      } = friendsByNotifiable;
      return [...pushNotifiable, ...smsNotifiable, ...notNotifiable];
    }
    const results: WorldFriend[] = [];
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
    friendsByNotifiable,
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
          href={routes.world.show.path()}
          mt={4}
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
        <Transition
          transition="fade"
          mounted={
            !!allFriends &&
            allFriends.length >= MIN_FRIENDS_FOR_SEARCH &&
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
            !!allFriends &&
            allFriends.length >= MIN_FRIENDS_FOR_SEARCH &&
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
                    overlayProps={{ radius: "xl", blur: 8 }}
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
          ) : isEmpty(displayedFriends) ? (
            <EmptyCard itemLabel="results" />
          ) : (
            displayedFriends.map(friend => (
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
    pwaScope={addTrailingSlash(routes.world.show.path())}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default WorldFriendsPage;
