import { isIosSafari, isIosWebview } from "@braintree/browser-detection";
import {
  ActionIcon,
  Affix,
  AspectRatio,
  type BoxProps,
  Image,
  Modal,
  type ModalProps,
  Overlay,
  Text,
} from "@mantine/core";
import { type PropsWithChildren } from "react";
import { mutate } from "swr";

import LockIcon from "~icons/heroicons/lock-closed-20-solid";

import addToHomeScreenStepSrc from "~/assets/images/add-to-home-screen-step.jpeg";
import openShareMenuStepSrc from "~/assets/images/open-share-menu-step.jpeg";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import FriendNotificationsButton from "~/components/FriendNotificationsButton";
import FriendPostCardActions from "~/components/FriendPostCardActions";
import HomeScreenPreview from "~/components/HomeScreenPreview";
import PostCard from "~/components/PostCard";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { useInstallPromptEvent, useIsStandalone } from "~/helpers/pwa";
import { useUserPagePosts } from "~/helpers/userPages";
import { useWebPush } from "~/helpers/webPush";
import {
  type Friend,
  type FriendNotificationSettings,
  type User,
} from "~/types";

import classes from "./UserPage.module.css";

export interface UserPageProps extends SharedPageProps {
  user: User;
  friendNotificationSettings: FriendNotificationSettings | null;
  replyPhoneNumber: string | null;
  faviconSrc: string;
  faviconImageSrc: string;
  appleTouchIconSrc: string;
  intent: "join" | "installation_instructions" | null;
}

const ICON_SIZE = 96;
const INSTALL_ALERT_INSET = "var(--mantine-spacing-md)";

const UserPage: PageComponent<UserPageProps> = ({
  user,
  replyPhoneNumber,
  intent,
}) => {
  const isStandalone = useIsStandalone();
  const currentFriend = useCurrentFriend();
  const [installModalOpened, setInstallModalOpened] = useState(false);
  useDidUpdate(() => {
    if (typeof isStandalone === "boolean") {
      setInstallModalOpened(!isStandalone);
    }
  }, [isStandalone]);
  const [skipWelcome, setSkipWelcome] = useState(
    () => intent === "installation_instructions",
  );
  const { registration } = useWebPush();

  return (
    <>
      <Stack>
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
            {currentFriend && (
              <Group gap="xs">
                <FriendNotificationsButton />
                {isStandalone && registration && (
                  <RefreshPostsButton userId={user.id} />
                )}
              </Group>
            )}
          </Stack>
        </Stack>
        {currentFriend && !!replyPhoneNumber ? (
          <Box pos="relative">
            <Feed {...{ user, replyPhoneNumber }} />
            {registration === null && (
              <Overlay backgroundOpacity={0} blur={3}>
                <Image
                  src={swirlyUpArrowSrc}
                  className={classes.notificationsRequiredIndicatorArrow}
                />
              </Overlay>
            )}
          </Box>
        ) : (
          <Alert title="this page is private" icon={<LockIcon />}>
            sorry! {user.name} needs to invite you first before you can see this
            page.
          </Alert>
        )}
      </Stack>
      {currentFriend && (
        <>
          <InstallModal
            opened={installModalOpened}
            onClose={() => {
              setInstallModalOpened(false);
            }}
            {...{ user, currentFriend, skipWelcome }}
          />
          <Affix
            position={{
              bottom: `calc(${INSTALL_ALERT_INSET} + env(safe-area-inset-bottom, 0px))`,
              left: INSTALL_ALERT_INSET,
              right: INSTALL_ALERT_INSET,
            }}
          >
            <Transition
              transition="pop"
              mounted={isStandalone === false && !installModalOpened}
            >
              {style => (
                <Alert
                  variant="filled"
                  icon={<NotificationIcon />}
                  title="join my smaller world :)"
                  className={classes.installAlert}
                  {...{ style }}
                >
                  <InstallAlertBody
                    onShowInstructions={() => {
                      setSkipWelcome(true);
                      setInstallModalOpened(true);
                    }}
                  />
                </Alert>
              )}
            </Transition>
          </Affix>
        </>
      )}
    </>
  );
};

UserPage.layout = page => (
  <AppLayout<UserPageProps>
    title={({ user, currentFriend, intent }) =>
      currentFriend && intent === "join"
        ? `you're invited to ${user.name}'s world`
        : `${user.name}'s world`
    }
    icons={({ faviconSrc, faviconImageSrc, appleTouchIconSrc }) => ({
      faviconSrc,
      faviconImageSrc,
      appleTouchIconSrc,
    })}
    manifestUrl={({ user, currentFriend }) =>
      currentFriend
        ? routes.users.manifest.path({
            id: user.id,
            query: {
              friend_token: currentFriend.access_token,
            },
          })
        : undefined
    }
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default UserPage;

interface FeedProps {
  user: User;
  replyPhoneNumber: string;
}

const Feed: FC<FeedProps> = ({ user, replyPhoneNumber }) => {
  const { posts } = useUserPagePosts(user.id);
  return (
    <Stack>
      {posts ? (
        isEmpty(posts) ? (
          <Card withBorder>
            <Stack justify="center" gap={2} ta="center" mih={60}>
              <Title order={4} lh="xs">
                no posts yet!
              </Title>
            </Stack>
          </Card>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              {...{ post }}
              actions={
                <FriendPostCardActions {...{ post, replyPhoneNumber }} />
              }
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

interface InstallModalProps extends Omit<ModalProps, "title" | "children"> {
  user: User;
  currentFriend: Friend;
  skipWelcome: boolean;
}

const InstallModal: FC<InstallModalProps> = ({
  user,
  currentFriend,
  skipWelcome,
  ...modalProps
}) => {
  const [step, setStep] = useState<"welcome" | "installation_instructions">(
    () => (skipWelcome ? "installation_instructions" : "welcome"),
  );
  useDidUpdate(() => {
    if (skipWelcome) {
      setStep("installation_instructions");
    }
  }, [skipWelcome]);
  const installPromptEvent = useInstallPromptEvent();
  const isInstallable = useIsInstallable(installPromptEvent);
  const directLinkToInstallInstructions = useDirectLinkToInstallInstructions(
    user,
    currentFriend,
  );
  const friendNameWithEmoji = useMemo(
    () => [currentFriend.emoji, currentFriend.name].filter(Boolean).join(" "),
    [currentFriend],
  );
  return (
    <Modal
      className={classes.installModal}
      {...(step === "installation_instructions" && {
        title: "join my smaller world :)",
      })}
      {...modalProps}
    >
      <Transition transition="pop" mounted={step === "welcome"}>
        {style => (
          <Stack gap="lg" align="center" pb="xs" {...{ style }}>
            <Stack gap={4}>
              <Title order={3} ta="center" maw={300}>
                hi, {friendNameWithEmoji}!
              </Title>
              <Text ta="center" maw={300}>
                i made this page to make it easy for you to get involved in my
                life&apos;s adventures :)
              </Text>
            </Stack>
            <HomeScreenPreview
              pageName={user.name}
              pageIcon={user.page_icon}
              arrowLabel="it's me!"
            />
            <Text ta="center" maw={300}>
              pin this page to your home screen so you can{" "}
              <span style={{ fontWeight: 600 }}>
                get notified about life updates, personal invitations, poems,
                and more!
              </span>
            </Text>
            <Stack gap={4} align="center">
              <Button<"button" | "a">
                leftSection={<InstallIcon />}
                loading={isInstallable === undefined}
                disabled={isInstallable === false}
                {...(directLinkToInstallInstructions
                  ? {
                      component: "a",
                      href: directLinkToInstallInstructions,
                      target: "_blank",
                    }
                  : {
                      onClick: () => {
                        if (installPromptEvent) {
                          void installPromptEvent.prompt();
                        } else if (isIosSafari()) {
                          setStep("installation_instructions");
                        }
                      },
                    })}
              >
                pin to home screen
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
        mounted={step === "installation_instructions"}
        {...(!skipWelcome && { enterDelay: 200 })}
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
                  pageName={user.name}
                  pageIcon={user.page_icon}
                  arrowLabel="open me!"
                />
              </Stack>
            </List.Item>
          </List>
        )}
      </Transition>
    </Modal>
  );
};

const useDirectLinkToInstallInstructions = (
  user: User,
  currentFriend: Friend,
) => {
  const [instructionsDirectLink, setInstructionsDirectLink] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (isIosWebview()) {
      const instructionsPath = routes.users.show.path({
        handle: user.handle,
        query: {
          friend_token: currentFriend.access_token,
          intent: "installation_instructions",
        },
      });
      const instructionsUrl = new URL(instructionsPath, location.origin);
      instructionsUrl.protocol = "x-safari-https:";
      setInstructionsDirectLink(instructionsUrl.toString());
    }
  }, [user.handle, currentFriend.access_token]);
  return instructionsDirectLink;
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
  const [isInstallable, setIsInstallable] = useState<boolean | undefined>(() =>
    installEvent ? true : undefined,
  );
  useEffect(() => {
    setIsInstallable(!!installEvent || isIosSafari());
  }, [installEvent]);
  return isInstallable;
};

interface InstallAlertBodyProps {
  onShowInstructions: () => void;
}

const InstallAlertBody: FC<InstallAlertBodyProps> = ({
  onShowInstructions,
}) => {
  const installPromptEvent = useInstallPromptEvent();
  const isInstallable = useIsInstallable(installPromptEvent);
  return (
    <Stack gap={8} align="start">
      <Text inherit>life updates, personal invitations, poems, and more!</Text>
      <Group gap="xs">
        <Button
          variant="white"
          size="compact-sm"
          leftSection={<InstallIcon />}
          className={classes.installAlertButton}
          disabled={isInstallable === false}
          onClick={() => {
            if (installPromptEvent) {
              void installPromptEvent.prompt();
            } else {
              onShowInstructions();
            }
          }}
        >
          pin this page
        </Button>
        {isInstallable === false && (
          <Text
            size="xs"
            opacity={0.6}
            lh={1.2}
            miw={0}
            style={{ flexGrow: 1 }}
          >
            sorry, your browser isn&apos;t supported
            <Text span inherit visibleFrom="xs">
              —pls open on your phone!
            </Text>
          </Text>
        )}
      </Group>
    </Stack>
  );
};

interface RefreshPostsButtonProps extends BoxProps {
  userId: string;
}

const RefreshPostsButton: FC<RefreshPostsButtonProps> = ({
  userId,
  ...otherProps
}) => {
  const {
    mutate: mutatePosts,
    isValidating,
    posts,
  } = useUserPagePosts(userId, {
    revalidateOnMount: false,
  });

  return (
    <ActionIcon
      variant="light"
      color="gray"
      size="lg"
      loading={isValidating}
      onClick={() => {
        const firstPost = first(posts);
        void mutate((key: string) => {
          if (typeof key === "string") {
            return key.startsWith("/posts");
          }
        });
        void mutatePosts().then(pages => {
          const latestFirstPage = first(pages);
          const latestFirstPost = first(latestFirstPage?.posts);
          if (
            firstPost &&
            latestFirstPost &&
            firstPost.id === latestFirstPost.id
          ) {
            toast.success("no new posts", {
              description: "you're all caught up :)",
            });
          }
        });
      }}
      {...otherProps}
    >
      <RefreshIcon />
    </ActionIcon>
  );
};
