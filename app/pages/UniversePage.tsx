import { type BoxProps, Image, Indicator, Text } from "@mantine/core";

import logoSrc from "~/assets/images/logo.png";

import AppLayout from "~/components/AppLayout";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { type World } from "~/types";

import classes from "./UniversePage.module.css";

export interface UniversePageProps extends SharedPageProps {}

const ICON_SIZE = 80;

const UniversePage: PageComponent<UniversePageProps> = () => {
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

  return (
    <Stack gap="xl">
      <Group gap={6} justify="center">
        <Image src={logoSrc} w={36} />
        <Title size="h2" className={classes.pageTitle}>
          smaller universe
        </Title>
      </Group>
      <Stack>
        <Group align="start" justify="center" wrap="wrap">
          {worlds ? (
            isEmpty(worlds) ? (
              <EmptyCard
                itemLabel="worlds"
                w="100%"
                maw="var(--container-size-xs)"
              />
            ) : (
              worlds.map(world => (
                <Anchor
                  className={classes.worldAnchor}
                  key={world.user_id}
                  component={Link}
                  href={routes.users.show.path({
                    handle: world.user_handle,
                    query: {
                      ...(!!world.associated_friend_access_token && {
                        friend_token: world.associated_friend_access_token,
                      }),
                    },
                  })}
                  mod={{ joined: !!world.associated_friend_access_token }}
                >
                  <Stack align="center" gap={8} w="min-content">
                    <WorldIcon {...{ world }} mx="sm" />
                    <Text ff="heading" size="sm" fw={600} ta="center">
                      {possessive(world.user_name)} world
                    </Text>
                  </Stack>
                </Anchor>
              ))
            )
          ) : (
            [...new Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                w={ICON_SIZE}
                h={ICON_SIZE}
                radius={ICON_SIZE / APPLE_ICON_RADIUS_RATIO}
              />
            ))
          )}
        </Group>
        <Text size="xs" c="dimmed" ta="center">
          (newly posted worlds shown first)
        </Text>
      </Stack>
    </Stack>
  );
};

UniversePage.layout = page => (
  <AppLayout<UniversePageProps> title="smaller universe">{page}</AppLayout>
);

export default UniversePage;

interface WorldIconProps extends BoxProps {
  world: World;
}

const WorldIcon: FC<WorldIconProps> = ({ world, ...otherProps }) => (
  <Box {...otherProps}>
    <Indicator
      className={classes.postCountIndicator}
      label={world.post_count}
      size={20}
      offset={4}
      disabled={!world.post_count}
      {...(!world.associated_friend_access_token && {
        color: "white",
      })}
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
        disabled={!world.last_post_created_at}
      >
        <Image
          className={classes.worldPageIcon}
          src={world.page_icon.src}
          srcSet={world.page_icon.src_set}
          radius={ICON_SIZE / APPLE_ICON_RADIUS_RATIO}
          style={{ "--size": rem(ICON_SIZE) }}
        />
      </Tooltip>
    </Indicator>
  </Box>
);
