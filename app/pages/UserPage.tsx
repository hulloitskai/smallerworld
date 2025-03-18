import { isIosSafari, isIosWebview } from "@braintree/browser-detection";
import {
  Affix,
  AspectRatio,
  type BoxProps,
  Image,
  Modal,
  Overlay,
  Text,
} from "@mantine/core";
import { useIsFirstRender } from "@mantine/hooks";
import { type PropsWithChildren } from "react";

import LockIcon from "~icons/heroicons/lock-closed-20-solid";

import addToHomeScreenStepSrc from "~/assets/images/add-to-home-screen-step.jpeg";
import openShareMenuStepSrc from "~/assets/images/open-share-menu-step.jpeg";

import AppLayout from "~/components/AppLayout";
import Feed from "~/components/Feed";
import FriendPostCardActions from "~/components/FriendPostCardActions";
import FriendPushNotificationsButton from "~/components/FriendPushNotificationsButton";
import HomeScreenPreview from "~/components/HomeScreenPreview";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { useInstallPromptEvent, useIsStandalone } from "~/helpers/pwa";
import { useWebPush } from "~/helpers/webPush";
import { type Friend, type User } from "~/types";

import classes from "./UserPage.module.css";

export interface UserPageProps extends SharedPageProps {
  user: User;
  currentFriend: Friend | null;
  replyPhoneNumber: string | null;
  showInstructions: boolean;
}

const ICON_SIZE = 96;
const INSTALL_ALERT_INSET = "var(--mantine-spacing-md)";

const UserPage: PageComponent<UserPageProps> = ({
  user,
  currentFriend,
  replyPhoneNumber,
  showInstructions: initialShowInstructions,
}) => {
  const [installModalOpened, setInstallModalOpened] = useState(false);
  const [showInstructions, setShowInstructions] = useState(
    initialShowInstructions,
  );
  const isStandalone = useIsStandalone();
  const isFirstRender = useIsFirstRender();
  useDidUpdate(() => {
    if (typeof isStandalone === "boolean") {
      setInstallModalOpened(!isStandalone);
    }
  }, [isStandalone]);
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
            style={{ boxShadow: "var(--mantine-shadow-lg)" }}
          />
          <Stack gap={4} align="center">
            <Title size="h2" lh="xs" ta="center">
              {user.name}&apos;s world
            </Title>
            {currentFriend && (
              <FriendPushNotificationsButton
                friendAccessToken={currentFriend.access_token}
              />
            )}
          </Stack>
        </Stack>
        {currentFriend && !!replyPhoneNumber ? (
          <Box pos="relative">
            <Feed
              {...{ user }}
              renderControls={post => (
                <FriendPostCardActions {...{ post, replyPhoneNumber }} />
              )}
              emptyCard={
                <Card withBorder>
                  <Stack justify="center" gap={2} ta="center" mih={60}>
                    <Title order={4} lh="xs">
                      no posts yet!
                    </Title>
                  </Stack>
                </Card>
              }
            />
            {!registration && <Overlay backgroundOpacity={0} blur={3} />}
          </Box>
        ) : (
          <Alert title="this page is private" icon={<LockIcon />}>
            sorry! {user.name} needs to invite you first before you can see this
            page.
          </Alert>
        )}
      </Stack>
      <Modal
        title="join my smaller world :)"
        opened={installModalOpened}
        onClose={() => {
          setInstallModalOpened(false);
        }}
        transitionProps={{
          ...(isFirstRender && { enterDelay: 2000 }),
        }}
        styles={{
          header: {
            minHeight: rem(40),
            lineHeight: "var(--mantine-line-height-xs)",
          },
        }}
      >
        <InstallModalBody {...{ user, showInstructions }} />
      </Modal>
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
              <Stack gap={8} align="start">
                <Text inherit>
                  life updates, personal invitations, poems, and more!
                </Text>
                <Button
                  variant="white"
                  size="compact-sm"
                  leftSection={<InstallIcon />}
                  className={classes.installAlertButton}
                  onClick={() => {
                    setShowInstructions(true);
                    setInstallModalOpened(true);
                  }}
                >
                  pin this page
                </Button>
              </Stack>
            </Alert>
          )}
        </Transition>
      </Affix>
    </>
  );
};

UserPage.layout = page => (
  <AppLayout<UserPageProps>
    title={({ user }) => `${user.name}'s world`}
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

interface InstallModalBodyProps {
  user: User;
  showInstructions: boolean;
}

const InstallModalBody: FC<InstallModalBodyProps> = ({
  user,
  showInstructions,
}) => {
  const [iosSafariInstructionsDisplayed, setIosInstructionsDisplayed] =
    useState(showInstructions);
  const installPromptEvent = useInstallPromptEvent();
  const isInstallable = useIsInstallable(installPromptEvent);
  const directLinkToInstallInstructions =
    useDirectLinkToInstallInstructions(user);
  return (
    <>
      <Transition transition="pop" mounted={!iosSafariInstructionsDisplayed}>
        {style => (
          <Stack gap="xs" align="center" {...{ style }}>
            <HomeScreenPreview
              pageName={user.name}
              pageIcon={user.page_icon}
              arrowLabel="this page!"
            />
            <Text size="sm" ta="center">
              pin this page to your home screen so you can{" "}
              <span style={{ fontWeight: 600 }}>
                get notified about life updates, personal invitations, poems,
                and more :)
              </span>
            </Text>
            <Stack gap={4}>
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
                          setIosInstructionsDisplayed(true);
                        }
                      },
                    })}
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
        {...(!showInstructions && {
          enterDelay: 200,
        })}
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

const useDirectLinkToInstallInstructions = (user: User) => {
  const [instructionsDirectLink, setInstructionsDirectLink] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (isIosWebview()) {
      const instructionsPath = routes.users.show.path({
        handle: user.handle,
        query: {
          show_instructions: true,
        },
      });
      const instructionsUrl = new URL(instructionsPath, location.origin);
      instructionsUrl.protocol = "x-safari-https:";
      setInstructionsDirectLink(instructionsUrl.toString());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
