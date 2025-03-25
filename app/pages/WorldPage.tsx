import { ActionIcon, Avatar, Image, Overlay, Text } from "@mantine/core";

import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import AuthorPostCardActions from "~/components/AuthorPostCardActions";
import LoadMoreButton from "~/components/LoadMoreButton";
import PostCard from "~/components/PostCard";
import WorldPageEnableNotificationsActionIcon from "~/components/WorldPageEnableNotificationsActionIcon";
import WorldPageFloatingActions from "~/components/WorldPageFloatingActions";
import WorldPageNotificationsButton from "~/components/WorldPageNotificationsButton";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { usePosts } from "~/helpers/posts";
import { useIsIosSafari } from "~/helpers/pwa";
import { useInstallPrompt } from "~/helpers/pwa";
import { useWebPush } from "~/helpers/webPush";
import { type FriendInfo, type User } from "~/types";

import classes from "./WorldPage.module.css";

export interface WorldPageProps extends SharedPageProps {
  currentUser: User;
  faviconSrc: string;
  faviconImageSrc: string;
  appleTouchIconSrc: string;
  friends: FriendInfo[];
}

const ICON_SIZE = 96;

const WorldPage: PageComponent<WorldPageProps> = ({ friends }) => {
  const isStandalone = useIsStandalone();
  const user = useAuthenticatedUser();
  const { registration } = useWebPush();

  // == Add to home screen
  const { install } = useInstallPrompt();
  const isIosSafari = useIsIosSafari();

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
                {possessive(user.name)} world
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
                          {friends.map(({ id, emoji }) => (
                            <Avatar key={id} size="sm">
                              {emoji ? (
                                <Text fz="md">{emoji}</Text>
                              ) : (
                                <Box component={UserIcon} fz="sm" c="white" />
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
                {isStandalone === false && (!!install || isIosSafari) && (
                  <WorldPageEnableNotificationsActionIcon {...{ user }} />
                )}
                {isStandalone && <WorldPageNotificationsButton />}
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
      <WorldPageFloatingActions />
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
    <IconsMeta />
    {page}
  </AppLayout>
);

export default WorldPage;

const IconsMeta: FC = () => {
  const { faviconSrc, faviconImageSrc, appleTouchIconSrc } =
    usePageProps<WorldPageProps>();
  return (
    <Head>
      <link head-key="favicon" rel="icon" href={faviconSrc} />
      <link
        head-key="favicon-image"
        rel="icon"
        type="image/png"
        href={faviconImageSrc}
        sizes="96x96"
      />
      <link
        head-key="apple-touch-icon"
        rel="apple-touch-icon"
        href={appleTouchIconSrc}
      />
    </Head>
  );
};

const Feed: FC = () => {
  const { posts, setSize, hasMorePosts } = usePosts();
  const [loadingMore, setLoadingMore] = useState(false);
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
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                {...{ post }}
                actions={<AuthorPostCardActions {...{ post }} />}
              />
            ))}
            {hasMorePosts && (
              <LoadMoreButton
                loading={loadingMore}
                style={{ alignSelf: "center" }}
                onVisible={() => {
                  setLoadingMore(true);
                  void setSize(size => size + 1).finally(() => {
                    setLoadingMore(false);
                  });
                }}
              />
            )}
          </>
        )
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [...new Array(3)].map((_, i) => <Skeleton key={i} h={120} />)
      )}
    </Stack>
  );
};
