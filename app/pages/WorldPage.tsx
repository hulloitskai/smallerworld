import { ActionIcon, Avatar, Image, Overlay, Text } from "@mantine/core";
import { takeRight } from "lodash-es";

import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import bottomLeftArrowSrc from "~/assets/images/bottom-left-arrow.png";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import AuthorPostCardActions from "~/components/AuthorPostCardActions";
import { openInstallationInstructionsModal } from "~/components/InstallationInstructionsModal";
import NewPost from "~/components/NewPost";
import PostCard from "~/components/PostCard";
import UserNotificationsButton from "~/components/UserNotificationsButton";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { usePosts } from "~/helpers/posts";
import {
  useInstallPromptEvent,
  useIsInstallable,
  useIsStandalone,
} from "~/helpers/pwa";
import { useWebPush } from "~/helpers/webPush";
import { type Friend, type User } from "~/types";

import classes from "./WorldPage.module.css";

export interface WorldPageProps extends SharedPageProps {
  currentUser: User;
}

const ICON_SIZE = 96;

const WorldPage: PageComponent<WorldPageProps> = () => {
  const isStandalone = useIsStandalone();
  const user = useAuthenticatedUser();
  const { registration } = useWebPush();
  const installPromptEvent = useInstallPromptEvent();
  const isInstallable = useIsInstallable(installPromptEvent);

  // == Friends
  const { data } = useRouteSWR<{ friends: Friend[] }>(routes.friends.index, {
    descriptor: "load friends",
  });
  const { friends } = data ?? {};

  return (
    <>
      <Stack gap="lg" pb="xl">
        <Box pos="relative">
          <Stack align="center" gap="sm">
            <Image
              src={user.page_icon.src}
              srcSet={user.page_icon.src_set}
              w={ICON_SIZE}
              h={ICON_SIZE}
              fit="cover"
              radius={ICON_SIZE / APPLE_ICON_RADIUS_RATIO}
              style={{
                flex: "unset",
                boxShadow: "var(--mantine-shadow-lg)",
              }}
            />
            <Stack gap={4} align="center">
              <Title size="h2" lh="xs" ta="center">
                {user.name}&apos;s world
              </Title>
              <Group gap={8}>
                {(!isStandalone || !!registration) && (
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
                )}
                {isInstallable && isStandalone === false && (
                  <Box pos="relative">
                    <Head>
                      <link
                        rel="preconnect"
                        href="https://fonts.googleapis.com"
                      />
                      <link
                        rel="preconnect"
                        href="https://fonts.gstatic.com"
                        crossOrigin="anonymous"
                      />
                      <link
                        href="https://fonts.googleapis.com/css2?family=Single+Day&display=swap"
                        rel="stylesheet"
                      />
                    </Head>
                    <ActionIcon
                      variant="light"
                      size="lg"
                      onClick={() => {
                        openInstallationInstructionsModal({
                          title: "enable notifications",
                          pageName: "smaller world",
                          pageIcon: user.page_icon,
                          children: (
                            <Text size="sm" ta="center" maw={300} mx="auto">
                              pin this page to your home screen so you can{" "}
                              <span style={{ fontWeight: 600 }}>
                                get notified when friends react to your posts
                              </span>
                              !
                            </Text>
                          ),
                        });
                      }}
                    >
                      <NotificationIcon />
                    </ActionIcon>
                    <Image
                      src={bottomLeftArrowSrc}
                      className={classes.enableNotificationsArrow}
                    />
                    <Text className={classes.enableNotificationsText}>
                      enable notifs :)
                    </Text>
                  </Box>
                )}
                {isStandalone && <UserNotificationsButton />}
              </Group>
            </Stack>
          </Stack>
          <Menu width={210} position="bottom-end" arrowOffset={16}>
            <Menu.Target>
              <ActionIcon pos="absolute" top={-6} right={0}>
                <MenuIcon />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                component={Link}
                leftSection={<EditIcon />}
                href={routes.signup.edit.path()}
              >
                customize your page
              </Menu.Item>
              <Menu.Item
                component="a"
                leftSection={<OpenExternalIcon />}
                href={routes.users.show.path({ handle: user.handle })}
                target="_blank"
              >
                view public profile
              </Menu.Item>
              <Menu.Item
                component={Link}
                leftSection={<JoinRequestsIcon />}
                href={routes.joinRequests.index.path()}
              >
                view join requests
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
        {(!isStandalone || !!registration) && !!friends && isEmpty(friends) && (
          <Alert>
            <Group justify="space-between">
              <Text inherit ff="heading" fw={600} c="primary" ml={6}>
                invite a friend to join your world:
              </Text>
              <AddFriendButton variant="white" size="compact-sm" />
            </Group>
          </Alert>
        )}
        <Box pos="relative">
          <Feed />
          {isStandalone && registration === null && (
            <Overlay backgroundOpacity={0} blur={3}>
              <Image
                src={swirlyUpArrowSrc}
                className={classes.notificationsRequiredIndicatorArrow}
              />
            </Overlay>
          )}
        </Box>
      </Stack>
      <NewPost disabled={isStandalone && registration === null} />
    </>
  );
};

WorldPage.layout = page => (
  <AppLayout<WorldPageProps>
    title="your world"
    manifestUrl={({ currentUser }) =>
      routes.users.manifest.path({ id: currentUser.id })
    }
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default WorldPage;

const Feed: FC = () => {
  const { posts } = usePosts();
  return (
    <Stack>
      {posts ? (
        isEmpty(posts) ? (
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
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              {...{ post }}
              actions={<AuthorPostCardActions {...{ post }} />}
            />
          ))
        )
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [...new Array(3)].map((_, i) => <Skeleton key={i} h={120} />)
      )}
    </Stack>
  );
};
