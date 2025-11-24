import { Text } from "@mantine/core";

import AppLayout from "~/components/AppLayout";
import UserFooter from "~/components/UserFooter";
import { worldManifestUrlForUser } from "~/helpers/userWorld";
import { type Space, type User, type World } from "~/types";

import classes from "./UserSpacesPage.module.css";

export interface UserSpacesPageProps extends SharedPageProps {
  currentUser: User;
  userWorld: World | null;
}

const UserSpacesPage: PageComponent<UserSpacesPageProps> = ({ userWorld }) => {
  useWorldTheme(userWorld?.theme ?? null);

  // == Load spaces
  const { data } = useRouteSWR<{ spaces: Space[] }>(routes.userSpaces.index, {
    descriptor: "load spaces",
  });
  const { spaces } = data ?? {};

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Title size="h2" className={classes.title} mx="md">
          your spaces
        </Title>
      </Stack>
      <Stack gap="sm">
        {spaces ? (
          isEmpty(spaces) ? (
            <Container size="xs" w="100%">
              <EmptyCard itemLabel="spaces" />
            </Container>
          ) : (
            spaces.map(space => (
              <Card key={space.id} withBorder>
                <Text ff="heading" fw={600}>
                  {space.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {space.description}
                </Text>
              </Card>
            ))
          )
        ) : (
          [...new Array(3)].map((_, i) => <Skeleton key={i} h={80} />)
        )}
      </Stack>
    </Stack>
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
