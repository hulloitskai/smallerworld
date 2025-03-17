import { Avatar, Image, Text } from "@mantine/core";
import { takeRight } from "lodash-es";

import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import AuthorPostCardControls from "~/components/AuthorPostCardActions";
import Feed from "~/components/Feed";
import NewPost from "~/components/NewPost";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { type Friend } from "~/types";

import classes from "./HomePage.module.css";

export interface HomePageProps extends SharedPageProps {}

const ICON_SIZE = 96;

const HomePage: PageComponent<HomePageProps> = () => {
  const user = useAuthenticatedUser();

  // == Friends
  const { data } = useRouteSWR<{ friends: Friend[] }>(routes.friends.index, {
    descriptor: "load friends",
  });
  const { friends } = data ?? {};

  return (
    <>
      <Stack gap="lg" pb="xl">
        <Stack align="center" gap="sm">
          <Image
            src={user.page_icon.src}
            srcSet={user.page_icon.src_set}
            w={ICON_SIZE}
            h={ICON_SIZE}
            fit="cover"
            radius={ICON_SIZE / APPLE_ICON_RADIUS_RATIO}
            style={{ boxShadow: "var(--mantine-shadow-lg)" }}
          />
          <Stack gap={4} align="center">
            <Title size="h2" lh="xs" ta="center">
              {user.name}&apos;s world
            </Title>
            <Button
              component={Link}
              href={routes.friends.index.path()}
              radius="xl"
              display="block"
              leftSection={
                friends && !isEmpty(friends) ? (
                  <Avatar.Group className={classes.avatarGroup}>
                    {takeRight(friends, 3).map(({ id, emoji }) => (
                      <Avatar key={id} size="sm">
                        {emoji ? (
                          <Text fz="md">{emoji}</Text>
                        ) : (
                          <Box component={UserIcon} fz="sm" c="primary" />
                        )}
                      </Avatar>
                    ))}
                  </Avatar.Group>
                ) : (
                  <Box component={FriendsIcon} />
                )
              }
            >
              your friends
            </Button>
          </Stack>
        </Stack>
        {!!friends && isEmpty(friends) && (
          <Alert>
            <Group justify="space-between">
              <Text inherit ff="heading" fw={600} c="primary" ml={6}>
                invite a friend to join your world:
              </Text>
              <AddFriendButton variant="white" size="compact-sm" />
            </Group>
          </Alert>
        )}
        <Feed
          {...{ user }}
          renderControls={post => <AuthorPostCardControls {...{ post }} />}
          emptyCard={
            <Card withBorder>
              <Stack justify="center" gap={2} ta="center" mih={60}>
                <Title order={4} lh="xs">
                  no posts yet!
                </Title>
                <Text size="sm">
                  create a new post with the{" "}
                  <Badge
                    variant="filled"
                    mx={4}
                    px={4}
                    styles={{
                      root: {
                        verticalAlign: "middle",
                      },
                      label: { display: "flex", alignItems: "center" },
                    }}
                  >
                    <NewIcon />
                  </Badge>{" "}
                  button :)
                </Text>
              </Stack>
            </Card>
          }
        />
      </Stack>
      <NewPost />
    </>
  );
};

HomePage.layout = page => (
  <AppLayout<HomePageProps>
    title="home"
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default HomePage;
