import {
  Image,
  Indicator,
  RemoveScroll,
  ScrollArea,
  Text,
} from "@mantine/core";

import AppLayout from "~/components/AppLayout";
import LocalUniversePageFeed from "~/components/LocalUniversePageFeed";
import WorldFooter from "~/components/WorldFooter";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { useWebPush } from "~/helpers/webPush";
import { type LocalUniverseWorld, type User } from "~/types";

import classes from "./LocalUniversePage.module.css";

export interface LocalUniversePageProps extends SharedPageProps {
  currentUser: User;
}

const ICON_SIZE = 80;

const LocalUniversePage: PageComponent<LocalUniversePageProps> = ({
  currentUser,
}) => {
  const { isStandalone, outOfPWAScope } = usePWA();
  const {
    pushRegistration,
    supported: webPushSupported,
    permission: webPushPermission,
  } = useWebPush();
  useUserTheme(currentUser.theme);

  // == Load worlds
  const { data } = useRouteSWR<{ worlds: LocalUniverseWorld[] }>(
    routes.localUniverse.worlds,
    {
      descriptor: "load worlds",
    },
  );
  const { worlds } = data ?? {};

  const body = (
    <Stack gap="xl" py="md">
      <Stack gap="lg">
        <Title size="h2" className={classes.pageTitle} mx="md">
          your universe
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
                      key={world.user_id}
                      component={PWAScopedLink}
                      href={withTrailingSlash(
                        world.user_id === currentUser.id
                          ? routes.world.show.path()
                          : routes.users.show.path({
                              id: world.user_handle,
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
                          {possessive(world.user_name)} world
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
                      radius={ICON_SIZE / USER_ICON_RADIUS_RATIO}
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
      <Divider
        label={
          <>
            <span className={classes.dividerText}>
              smaller happenings in your universe
            </span>{" "}
            <span className={classes.dividerEmoji}>⤵️</span>
          </>
        }
        className={classes.centered}
      />
      <LocalUniversePageFeed className={classes.centered} />
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

LocalUniversePage.layout = page => (
  <AppLayout<LocalUniversePageProps>
    title="your universe"
    manifestUrl={routes.world.manifest.path()}
    pwaScope={withTrailingSlash(routes.world.show.path())}
    footer={<WorldFooter />}
  >
    {page}
  </AppLayout>
);

export default LocalUniversePage;

interface WorldIconProps extends BoxProps {
  world: LocalUniverseWorld;
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
