import { Image, Text } from "@mantine/core";

import AppLayout from "~/components/AppLayout";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { type Space } from "~/types";

import classes from "./SpacePage.module.css";

interface SpacePageProps extends SharedPageProps {
  space: Space;
}

const SPACE_ICON_SIZE = 96;

const SpacePage: PageComponent<SpacePageProps> = ({ space }) => {
  useWorldTheme("cloudflow");
  const currentUser = useCurrentUser();

  return (
    <Stack>
      {currentUser?.id === space.owner_id && (
        <Button
          component={Link}
          href={routes.userSpaces.index.path()}
          leftSection={<BackIcon />}
          style={{ alignSelf: "center" }}
        >
          your spaces
        </Button>
      )}
      <Stack gap="xs" align="center">
        {space.icon && (
          <Image
            className={classes.spaceIcon}
            src={space.icon.src}
            {...(!!space.icon.srcset && { srcSet: space.icon.srcset })}
            w={SPACE_ICON_SIZE}
            h={SPACE_ICON_SIZE}
            radius={SPACE_ICON_SIZE / WORLD_ICON_RADIUS_RATIO}
            onClick={() => {
              const pageUrl = normalizeUrl(
                routes.spaces.show.path({
                  id: space.friendly_id,
                }),
              );
              void navigator.clipboard.writeText(pageUrl).then(() => {
                toast.success("page url copied");
              });
            }}
          />
        )}
        <Box ta="center">
          <Title size="h2" lh="xs">
            {space.name}
          </Title>
          <Text size="xs" c="dimmed">
            {space.description}
          </Text>
        </Box>
      </Stack>
      <Card withBorder>
        q: could you make a post in this space?
        <br />
        a: it&apos;s conceivable...
      </Card>
    </Stack>
  );
};

SpacePage.layout = page => (
  <AppLayout<SpacePageProps>
    title={({ space }) => space.name}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default SpacePage;
