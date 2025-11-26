import { Avatar, Text } from "@mantine/core";

import AppLayout from "~/components/AppLayout";
import NewSpaceButton from "~/components/NewSpaceButton";
import UserFooter from "~/components/UserFooter";
import { worldManifestUrlForUser } from "~/helpers/userWorld";
import { type Space, type User, type World } from "~/types";

import classes from "./UserSpacesPage.module.css";

export interface UserSpacesPageProps extends SharedPageProps {
  currentUser: User;
  userWorld: World | null;
}

const UserSpacesPage: PageComponent<UserSpacesPageProps> = ({ userWorld }) => {
  useWorldTheme(userWorld?.theme);

  // == Load spaces
  const { data } = useRouteSWR<{ spaces: Space[] }>(routes.userSpaces.index, {
    descriptor: "load spaces",
  });
  const { spaces } = data ?? {};

  return (
    <>
      <Stack gap="lg">
        <Title size="h2" className={classes.title} ta="center">
          your spaces
        </Title>
        <Stack gap="sm">
          <NewSpaceButton
            variant="default"
            size="md"
            h="unset"
            py="md"
            onSpaceCreated={space => {
              router.visit(routes.spaces.show.path({ id: space.friendly_id }));
            }}
          />
          {spaces ? (
            isEmpty(spaces) ? (
              <EmptyCard itemLabel="spaces" />
            ) : (
              spaces.map(space => (
                <AnchorContainer
                  key={space.id}
                  component={Link}
                  href={routes.spaces.show.path({ id: space.friendly_id })}
                >
                  <Card withBorder>
                    <Group align="flex-start" gap="md">
                      <Avatar
                        radius="xl"
                        size="lg"
                        {...(!!space.icon && { src: space.icon.src })}
                        alt={space.name}
                      />
                      <Stack gap={4} flex={1}>
                        <Text ff="heading" fw={600}>
                          {space.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {space.description}
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                </AnchorContainer>
              ))
            )
          ) : (
            [...new Array(3)].map((_, i) => <Skeleton key={i} h={80} />)
          )}
        </Stack>
      </Stack>
    </>
  );
};

UserSpacesPage.layout = page => (
  <AppLayout<UserSpacesPageProps>
    title="your spaces"
    manifestUrl={({ currentUser }) => worldManifestUrlForUser(currentUser)}
    pwaScope={withTrailingSlash(routes.userWorld.show.path())}
    footer={({ currentUser, userWorld }) => (
      <UserFooter {...{ currentUser }} world={userWorld} />
    )}
    withContainer
    containerSize="xs"
  >
    {page}
  </AppLayout>
);

export default UserSpacesPage;
