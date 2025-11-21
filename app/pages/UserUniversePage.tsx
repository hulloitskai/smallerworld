import {
  Image,
  Indicator,
  RemoveScroll,
  ScrollArea,
  Text,
} from "@mantine/core";

import AppLayout from "~/components/AppLayout";
import UserUniversePageFeed from "~/components/UserUniversePageFeed";
import WorldFooter from "~/components/WorldFooter";
import { worldManifestUrlForUser } from "~/helpers/userWorld";
import { useWebPush } from "~/helpers/webPush";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { useWorldTheme } from "~/helpers/worldThemes";
import { type UniverseWorldProfile, type User, type World } from "~/types";

import classes from "./UserUniversePage.module.css";

export interface UserUniversePageProps extends SharedPageProps {
  currentUser: User;
  userWorld: World | null;
}

const ICON_SIZE = 80;

const UserUniversePage: PageComponent<UserUniversePageProps> = ({
  currentUser,
  userWorld,
}) => {
  useWorldTheme(userWorld?.theme ?? null);
  const { isStandalone, outOfPWAScope } = usePWA();
  const {
    pushRegistration,
    supported: webPushSupported,
    permission: webPushPermission,
  } = useWebPush();

  // == Load worlds
  const { data } = useRouteSWR<{ worlds: UniverseWorldProfile[] }>(
    routes.userUniverse.worlds,
    {
      descriptor: "load worlds",
    },
  );
  const { worlds } = data ?? {};

  const body = (
    <Stack gap="lg" py="md">
      <Stack gap="sm">
        <Title size="h2" className={classes.pageTitle} mx="md">
          smaller universe
        </Title>
        {worlds && isEmpty(worlds) ? (
          <Container size="xs" w="100%">
            <EmptyCard itemLabel="worlds" />
          </Container>
        ) : (
          <Box>
            <ScrollArea
              className={classes.scrollArea}
              offsetScrollbars="present"
            >
              {worlds
                ? worlds.map(world => (
                    <Anchor
                      className={classes.worldAnchor}
                      key={world.id}
                      component={PWAScopedLink}
                      href={withTrailingSlash(
                        world.owner_id === currentUser.id
                          ? routes.userWorld.show.path()
                          : routes.worlds.show.path({
                              id: world.id,
                              query: {
                                ...(!!world.associated_friend_access_token && {
                                  friend_token:
                                    world.associated_friend_access_token,
                                }),
                              },
                            }),
                      )}
                      mod={{ dimmed: !world.uncleared_notification_count }}
                    >
                      <Stack align="center" gap={8} w="min-content">
                        <WorldIcon {...{ world }} mx="sm" />
                        <Text ff="heading" size="sm" fw={600} ta="center">
                          {world.name}
                        </Text>
                      </Stack>
                    </Anchor>
                  ))
                : [...new Array(6)].map((_, i) => (
                    <Skeleton
                      className={classes.worldSkeleton}
                      key={i}
                      w={ICON_SIZE}
                      h={ICON_SIZE}
                      radius={ICON_SIZE / WORLD_ICON_RADIUS_RATIO}
                    />
                  ))}
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
                smaller happenings in your universe
              </span>{" "}
              <span className={classes.dividerEmoji}>⤵️</span>
            </>
          }
        />
      </Container>
      <Container size="xs" w="100%">
        <UserUniversePageFeed {...{ userWorld }} />
      </Container>
    </Stack>
  );
  return (
    <>
      <RemoveScroll
        enabled={
          isStandalone &&
          !outOfPWAScope &&
          !pushRegistration &&
          webPushSupported !== false &&
          webPushPermission !== "denied"
        }
      >
        {body}
      </RemoveScroll>
    </>
  );
};

UserUniversePage.layout = page => (
  <AppLayout<UserUniversePageProps>
    title="your universe"
    manifestUrl={({ currentUser }) => worldManifestUrlForUser(currentUser)}
    pwaScope={withTrailingSlash(routes.userWorld.show.path())}
    footer={({ userWorld }) => <WorldFooter world={userWorld} />}
    padding={0}
  >
    {page}
  </AppLayout>
);

export default UserUniversePage;

interface WorldIconProps extends BoxProps {
  world: UniverseWorldProfile;
}

const WorldIcon: FC<WorldIconProps> = ({ world, ...otherProps }) => (
  <Box {...otherProps}>
    <Indicator
      className={classes.postCountIndicator}
      label={world.uncleared_notification_count}
      size={20}
      offset={4}
      disabled={!world.uncleared_notification_count}
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
          src={world.icon.src}
          {...(!!world.icon.srcset && { srcSet: world.icon.srcset })}
          w={ICON_SIZE}
          h={ICON_SIZE}
          radius={ICON_SIZE / WORLD_ICON_RADIUS_RATIO}
        />
      </Tooltip>
    </Indicator>
  </Box>
);
