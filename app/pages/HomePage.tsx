import { isIosSafari } from "@braintree/browser-detection";
import {
  ActionIcon,
  AspectRatio,
  Avatar,
  Image,
  Overlay,
  Text,
} from "@mantine/core";
import { takeRight } from "lodash-es";

import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import addToHomeScreenStepSrc from "~/assets/images/add-to-home-screen-step.jpeg";
import openShareMenuStepSrc from "~/assets/images/open-share-menu-step.jpeg";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import AuthorPostCardControls from "~/components/AuthorPostCardActions";
import HomeScreenPreview from "~/components/HomeScreenPreview";
import NewPost from "~/components/NewPost";
import PostCard from "~/components/PostCard";
import UserNotificationsButton from "~/components/UserNotificationsButton";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { usePosts } from "~/helpers/posts";
import { useInstallPromptEvent, useIsStandalone } from "~/helpers/pwa";
import { useWebPush } from "~/helpers/webPush";
import { type Friend } from "~/types";

import classes from "./HomePage.module.css";

export interface HomePageProps extends SharedPageProps {}

const ICON_SIZE = 96;

const HomePage: PageComponent<HomePageProps> = () => {
  const isStandalone = useIsStandalone();
  const user = useAuthenticatedUser();
  const { registration } = useWebPush();

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
                {isStandalone === false && (
                  <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={() => {
                      openModal({
                        title: "enable notifications",
                        children: (
                          <InstallModalBody onInstalled={closeAllModals} />
                        ),
                      });
                    }}
                  >
                    <NotificationIcon />
                  </ActionIcon>
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
                href={routes.signups.edit.path()}
              >
                customize your page
              </Menu.Item>
              <Menu.Item
                component={Link}
                leftSection={<UserIcon />}
                href={routes.users.show.path({ handle: user.handle })}
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

HomePage.layout = page => (
  <AppLayout<HomePageProps>
    title="home"
    manifestUrl={routes.user.manifest.path()}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default HomePage;

interface InstallModalBodyProps {
  onInstalled: () => void;
}

const InstallModalBody: FC<InstallModalBodyProps> = ({ onInstalled }) => {
  const [iosSafariInstructionsDisplayed, setIosInstructionsDisplayed] =
    useState(false);
  const installPromptEvent = useInstallPromptEvent();
  const isInstallable = useIsInstallable(installPromptEvent);
  return (
    <>
      <Transition transition="pop" mounted={!iosSafariInstructionsDisplayed}>
        {style => (
          <Stack gap="xs" align="center" {...{ style }}>
            <HomeScreenPreview
              pageName="smaller world"
              pageIcon={{ src: "/logo.png" }}
              arrowLabel="this page!"
            />
            <Text size="sm" ta="center">
              pin this page to your home screen so you can{" "}
              <span style={{ fontWeight: 600 }}>
                get notified when friends react to your posts
              </span>
              !
            </Text>
            <Stack gap={4} align="center">
              <Button
                leftSection={<InstallIcon />}
                loading={isInstallable === undefined}
                disabled={isInstallable === false}
                onClick={() => {
                  if (installPromptEvent) {
                    void installPromptEvent.prompt().then(onInstalled);
                  } else if (isIosSafari()) {
                    setIosInstructionsDisplayed(true);
                  }
                }}
              >
                pin to home screen!
              </Button>
              {isInstallable === false && (
                <Text size="xs" c="dimmed">
                  sorry, your browser isn&apos;t supported
                  <Text span inherit visibleFrom="xs">
                    —pls open on your phone!
                  </Text>
                </Text>
              )}
            </Stack>
          </Stack>
        )}
      </Transition>
      <Transition
        transition="fade-up"
        mounted={iosSafariInstructionsDisplayed}
        enterDelay={200}
      >
        {style => (
          <List
            type="ordered"
            className={classes.installInstructionsList}
            {...{ style }}
          >
            <List.Item>
              <StepWithImage
                imageSrc={openShareMenuStepSrc}
                aspectRatio={3.066654640570037}
              >
                open the share menu
              </StepWithImage>
            </List.Item>
            <List.Item>
              <StepWithImage
                imageSrc={addToHomeScreenStepSrc}
                aspectRatio={0.804664723}
              >
                tap 'Add to Home Screen'
              </StepWithImage>
            </List.Item>
            <List.Item>
              <Stack gap={2}>
                <Box>find the icon on your home screen and open it!</Box>
                <HomeScreenPreview
                  pageName="smaller world"
                  pageIcon={{ src: "/logo.png" }}
                  arrowLabel="this one!"
                />
              </Stack>
            </List.Item>
          </List>
        )}
      </Transition>
    </>
  );
};

interface StepWithImageProps extends PropsWithChildren<BoxProps> {
  imageSrc: string;
  aspectRatio: number;
}

const StepWithImage: FC<StepWithImageProps> = ({
  imageSrc,
  aspectRatio,
  children,
  ...otherProps
}) => {
  return (
    <Stack align="stretch" gap={2} {...otherProps}>
      <Box>{children}</Box>
      <AspectRatio ratio={aspectRatio} maw={300}>
        <Image src={imageSrc} radius="md" />
      </AspectRatio>
    </Stack>
  );
};

const useIsInstallable = (
  installEvent: Event | null | undefined,
): boolean | undefined => {
  const [isInstallable, setIsInstallable] = useState<boolean | undefined>(
    undefined,
  );
  useEffect(() => {
    if (installEvent || isIosSafari()) {
      setIsInstallable(true);
    } else {
      setIsInstallable(false);
    }
  }, [installEvent]);
  return isInstallable;
};

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
              actions={<AuthorPostCardControls {...{ post }} />}
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
