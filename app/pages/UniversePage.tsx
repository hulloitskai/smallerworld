import {
  type BoxProps,
  Image,
  Indicator,
  Overlay,
  RemoveScroll,
  ScrollArea,
  Text,
} from "@mantine/core";

import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import SingleDayFontHead from "~/components/SingleDayFontHead";
import UniversePageFeed from "~/components/UniversePageFeed";
import UniversePageInstallAlert from "~/components/UniversePageInstallAlert";
import UniversePageNotificationsButton from "~/components/UniversePageNotificationsButton";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { useWebPush } from "~/helpers/webPush";
import { type User, type World } from "~/types";

import classes from "./UniversePage.module.css";

export interface UniversePageProps extends SharedPageProps {}

const ICON_SIZE = 80;

const UniversePage: PageComponent<UniversePageProps> = () => {
  const { isStandalone, outOfPWAScope } = usePWA();
  const currentUser = useCurrentUser();
  const { registration } = useWebPush();
  useUserTheme("aquatica");

  // == Load worlds
  const { data } = useRouteSWR<{ joinedWorlds: World[]; otherWorlds: World[] }>(
    routes.universe.worlds,
    {
      descriptor: "load worlds",
    },
  );
  const worlds = useMemo(() => {
    if (data) {
      const { joinedWorlds, otherWorlds } = data;
      return [...joinedWorlds, ...otherWorlds];
    }
  }, [data]);

  const body = (
    <Stack gap="xl" py="md">
      <Stack gap="lg">
        <Title size="h2" className={classes.pageTitle} mx="md">
          💫 smaller universe
        </Title>
        {worlds && isEmpty(worlds) ? (
          <EmptyCard
            itemLabel="worlds"
            w="100%"
            maw="var(--container-size-xs)"
            mx="md"
          />
        ) : (
          <Box>
            <ScrollArea className={classes.scrollArea}>
              <Group align="start" justify="center">
                {worlds
                  ? worlds.map(world => (
                      <Anchor
                        className={classes.worldAnchor}
                        key={world.user_id}
                        component={PWAScopedLink}
                        href={routes.users.show.path({
                          handle: world.user_handle,
                          query: {
                            ...(!!world.associated_friend_access_token && {
                              friend_token:
                                world.associated_friend_access_token,
                            }),
                          },
                        })}
                        mod={{ joined: isJoinedWorld(world, currentUser) }}
                      >
                        <Stack align="center" gap={8} w="min-content">
                          <WorldIcon {...{ world }} mx="sm" />
                          <Text ff="heading" size="sm" fw={600} ta="center">
                            {possessive(world.user_name)} world
                          </Text>
                        </Stack>
                      </Anchor>
                    ))
                  : [...new Array(6)].map((_, i) => (
                      <Skeleton
                        key={i}
                        w={ICON_SIZE}
                        h={ICON_SIZE}
                        radius={ICON_SIZE / USER_ICON_RADIUS_RATIO}
                      />
                    ))}
              </Group>
            </ScrollArea>
            {!!worlds && (
              <Text size="xs" c="dimmed" ta="center">
                (newly posted worlds shown first)
              </Text>
            )}
          </Box>
        )}
      </Stack>
      <Container size="xs" w="100%">
        <Divider
          label={
            <>
              <span className={classes.dividerText}>
                smaller happenings around the universe
              </span>{" "}
              <span className={classes.dividerEmoji}>⤵️</span>
            </>
          }
        />
      </Container>
      <Container size="xs" w="100%">
        <UniversePageFeed />
      </Container>
    </Stack>
  );
  return (
    <>
      <RemoveScroll enabled={isStandalone && !outOfPWAScope && !registration}>
        {body}
      </RemoveScroll>
      {isStandalone === false && <UniversePageInstallAlert />}
      {isStandalone && !outOfPWAScope && registration === null && (
        <>
          <Overlay backgroundOpacity={0} blur={3} pos="fixed">
            <SingleDayFontHead />
            <Stack align="center" justify="center" pos="absolute" inset={0}>
              <UniversePageNotificationsButton />
              <Group justify="center" align="end" gap="xs">
                <Text className={classes.notificationsRequiredIndicatorText}>
                  pretty&nbsp;please? 👉&#8288;👈
                </Text>
                <Image
                  src={swirlyUpArrowSrc}
                  className={classes.notificationsRequiredIndicatorArrow}
                />
              </Group>
            </Stack>
          </Overlay>
        </>
      )}
    </>
  );
};

UniversePage.layout = page => (
  <AppLayout<UniversePageProps>
    title="smaller universe"
    manifestUrl={routes.universe.manifest.path()}
    padding={0}
  >
    {page}
  </AppLayout>
);

export default UniversePage;

interface WorldIconProps extends BoxProps {
  world: World;
}

const WorldIcon: FC<WorldIconProps> = ({ world, ...otherProps }) => {
  const currentUser = useCurrentUser();
  const joinedWorld = isJoinedWorld(world, currentUser);
  return (
    <Box {...otherProps}>
      <Indicator
        className={classes.postCountIndicator}
        label={world.post_count}
        size={20}
        offset={4}
        {...(!joinedWorld && { color: "white" })}
      >
        <Tooltip
          label={
            <>
              {!!world.last_post_created_at && (
                <>
                  last posted on{" "}
                  <Time format={DateTime.DATETIME_MED} inherit>
                    {world.last_post_created_at}
                  </Time>
                </>
              )}
            </>
          }
          events={{ hover: true, focus: true, touch: true }}
          disabled={!world.last_post_created_at}
        >
          <Image
            className={classes.worldPageIcon}
            src={world.page_icon.src}
            srcSet={world.page_icon.srcset ?? undefined}
            w={ICON_SIZE}
            h={ICON_SIZE}
            radius={ICON_SIZE / USER_ICON_RADIUS_RATIO}
          />
        </Tooltip>
      </Indicator>
    </Box>
  );
};

const isJoinedWorld = (world: World, currentUser: User | null) =>
  currentUser?.id === world.user_id || !!world.associated_friend_access_token;
