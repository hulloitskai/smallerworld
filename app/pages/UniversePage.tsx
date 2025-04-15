import { Image, Text } from "@mantine/core";

import logoSrc from "~/assets/images/logo.png";

import AppLayout from "~/components/AppLayout";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { type User, type World } from "~/types";

import classes from "./UniversePage.module.css";

export interface UniversePageProps extends SharedPageProps {
  currentUser: User;
  worlds: World[];
}

const ICON_SIZE = 96;

const UniversePage: PageComponent<UniversePageProps> = ({ worlds }) => {
  return (
    <Stack gap="xl">
      <Group gap={6} justify="center">
        <Image src={logoSrc} w={36} />
        <Title size="h2" ta="center">
          cinematic universe
        </Title>
      </Group>
      <Group align="start" justify="center" wrap="wrap">
        {worlds.map(world => (
          <Anchor
            key={world.id}
            component={Link}
            href={routes.users.show.path({ handle: world.handle })}
          >
            <Stack align="center" gap={8} px="md" w="min-content">
              <Image
                className={classes.worldPageIcon}
                src={world.page_icon.src}
                srcSet={world.page_icon.src_set}
                radius={ICON_SIZE / APPLE_ICON_RADIUS_RATIO}
                style={{ "--size": rem(ICON_SIZE) }}
              />
              <Text ff="heading" size="sm" fw={600} ta="center">
                {possessive(world.user_name)} world
              </Text>
            </Stack>
          </Anchor>
        ))}
      </Group>
    </Stack>
  );
};

UniversePage.layout = page => (
  <AppLayout<UniversePageProps> title="universe">{page}</AppLayout>
);

export default UniversePage;
