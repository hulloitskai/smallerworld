import { isIosSafari } from "@braintree/browser-detection";
import { ActionIcon, AspectRatio, Avatar, Image, Text } from "@mantine/core";
import { takeRight } from "lodash-es";

import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import addToHomeScreenStepSrc from "~/assets/images/add-to-home-screen-step.jpeg";
import openShareMenuStepSrc from "~/assets/images/open-share-menu-step.jpeg";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import AuthorPostCardControls from "~/components/AuthorPostCardActions";
import Feed from "~/components/Feed";
import HomeScreenPreview from "~/components/HomeScreenPreview";
import NewPost from "~/components/NewPost";
import UserPushNotificationsButton from "~/components/UserPushNotificationsButton";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { useInstallPromptEvent, useIsStandalone } from "~/helpers/pwa";
import { type Friend } from "~/types";

import classes from "./HomePage.module.css";

export interface HomePageProps extends SharedPageProps {}

const ICON_SIZE = 96;

const HomePage: PageComponent<HomePageProps> = () => {
  const isStandalone = useIsStandalone();
  const user = useAuthenticatedUser();

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
                {isStandalone === true && <UserPushNotificationsButton />}
              </Group>
            </Stack>
          </Stack>
          <Button
            pos="absolute"
            top={0}
            right={0}
            component={Link}
            variant="subtle"
            href={routes.signups.edit.path()}
            size="compact-sm"
          >
            edit
          </Button>
        </Box>
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
    manifestUrl="/site.webmanifest"
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
            <Stack gap={4}>
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
                  sorry, your browser isn&apos;t supported :(
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
