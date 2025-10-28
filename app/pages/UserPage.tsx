import { Image, Overlay, Popover, RemoveScroll, Text } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import { useModals } from "@mantine/modals";

import logoSrc from "~/assets/images/logo.png";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import SingleDayFontHead from "~/components/SingleDayFontHead";
import UserPageDialogStateProvider from "~/components/UserPageDialogStateProvider";
import UserPageFeed from "~/components/UserPageFeed";
import UserPageFloatingActions from "~/components/UserPageFloatingActions";
import UserPageInstallAlert from "~/components/UserPageInstallAlert";
import { openUserPageInstallationInstructionsModal } from "~/components/UserPageInstallationInstructionsModal";
import UserPageInvitationsButton from "~/components/UserPageInvitationsButton";
import UserPageNotificationsButtonCard from "~/components/UserPageNotificationsButtonCard";
import UserPageRefreshButton from "~/components/UserPageRefreshButton";
import { UserPageRequestInvitationAlert } from "~/components/UserPageRequestInvitationAlert";
import WelcomeBackToast from "~/components/WelcomeBackToast";
import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { useWebPush } from "~/helpers/webPush";
import { type Encouragement, type UserProfile } from "~/types";

import classes from "./UserPage.module.css";

export interface UserPageProps extends SharedPageProps {
  user: UserProfile;
  replyToNumber: string | null;
  lastSentEncouragement: Encouragement | null;
  invitationRequested: boolean;
  hideNeko: boolean;
  allowFriendSharing: boolean;
}

const ICON_SIZE = 96;

const UserPage: PageComponent<UserPageProps> = ({ user }) => {
  const { isStandalone, outOfPWAScope } = usePWA();
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();
  const {
    pushRegistration,
    supported: webPushSupported,
    permission: webPushPermission,
  } = useWebPush();

  // == Reload page props on window focus
  useWindowEvent("focus", () => {
    if (!isStandalone || outOfPWAScope) {
      return;
    }
    router.reload({
      only: [
        "currentUser",
        "currentFriend",
        "faviconLinks",
        "user",
        "lastSentEncouragement",
        "hideNeko",
        "allowFriendSharing",
      ],
      async: true,
    });
  });

  // == User theme
  const userTheme = useUserTheme(user.theme);

  // == Installation instructions modal
  const queryParams = useQueryParams();
  const { modals } = useModals();
  useEffect(() => {
    if (!isEmpty(modals) || !currentFriend) {
      return;
    }
    if (queryParams.intent === "installation_instructions") {
      openUserPageInstallationInstructionsModal({ user });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const body = (
    <Stack>
      {currentUser?.id === user.id && !queryParams.friend_token && (
        <Alert className={classes.publicProfileAlert}>
          <Group gap="xs" justify="space-between">
            <Group align="start" gap={8}>
              <Box component={PublicIcon} style={{ flexShrink: 0 }} mt={4} />
              <Text ff="heading" fw={700}>
                your public profile
              </Text>
            </Group>
            <Button
              component={Link}
              href={withTrailingSlash(routes.world.show.path())}
              variant="white"
              leftSection={<BackIcon />}
              style={{ flexShrink: 0 }}
              mt={4}
              {...(userTheme === "bakudeku" && {
                variant: "filled",
              })}
            >
              back to your world
            </Button>
          </Group>
        </Alert>
      )}
      <Box pos="relative">
        <Stack gap="sm">
          <Image
            className={classes.pageIcon}
            src={user.page_icon.src}
            srcSet={user.page_icon.srcset ?? undefined}
            w={ICON_SIZE}
            h={ICON_SIZE}
            radius={ICON_SIZE / USER_ICON_RADIUS_RATIO}
            {...(currentFriend && {
              onClick: () => {
                const pageUrl = normalizeUrl(
                  routes.users.show.path({
                    id: user.handle,
                    query: {
                      friend_token: currentFriend.access_token,
                    },
                  }),
                );
                void navigator.clipboard.writeText(pageUrl).then(() => {
                  toast.success("page url copied");
                });
              },
            })}
          />
          <Stack gap={4}>
            <Title size="h2" className={classes.pageTitle}>
              {possessive(user.name)} world
            </Title>
            {!currentFriend ? null : isStandalone === undefined ? (
              <Skeleton style={{ alignSelf: "center", width: "unset" }}>
                <Button>some placeholder</Button>
              </Skeleton>
            ) : isStandalone &&
              !outOfPWAScope &&
              webPushPermission !== "denied" ? (
              <Group gap="xs" justify="center">
                <UserPageNotificationsButtonCard {...{ currentFriend }} />
                {pushRegistration && (
                  <UserPageRefreshButton
                    userId={user.id}
                    {...(userTheme === "bakudeku" && {
                      variant: "filled",
                    })}
                  />
                )}
              </Group>
            ) : (
              <Group gap="xs" justify="center">
                <UserPageInvitationsButton
                  {...(userTheme === "bakudeku" && {
                    variant: "filled",
                  })}
                />
                {isStandalone && !outOfPWAScope && (
                  <UserPageRefreshButton
                    userId={user.id}
                    {...(userTheme === "bakudeku" && {
                      variant: "filled",
                    })}
                  />
                )}
              </Group>
            )}
          </Stack>
        </Stack>
        {(isStandalone === true || !currentUser) && (
          <Popover position="bottom-end" arrowOffset={20} width={228}>
            <Popover.Target>
              <ActionIcon pos="absolute" top={0} right={0} size="lg">
                <Image src={logoSrc} h={26} w="unset" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap="xs">
                <Stack gap={8}>
                  <Text ta="center" ff="heading" fw={600}>
                    wanna make your own smaller world?
                  </Text>
                  <Button
                    component={PWAScopedLink}
                    target="_blank"
                    href={routes.session.new.path()}
                    leftSection="😍"
                    styles={{
                      section: {
                        fontSize: "var(--mantine-font-size-lg)",
                      },
                    }}
                  >
                    create your world
                  </Button>
                </Stack>
                <Divider mt={4} mx="calc(-1 * var(--mantine-spacing-xs))" />
                <Anchor
                  href={routes.feedback.redirect.path()}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  size="xs"
                  inline
                  ta="center"
                  ff="heading"
                  data-canny-link
                >
                  got feedback or feature requests?
                </Anchor>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
      </Box>
      {isStandalone && webPushPermission === "denied" && (
        <Alert
          icon="💔"
          title={
            <>
              you&apos;re using smaller world with push notifications disabled
            </>
          }
          className={classes.pushNotificationsDisabledAlert}
        >
          <Stack gap={2} lh={1.3}>
            <Text inherit>
              enable notifications to be a part of {possessive(user.name)}{" "}
              support system, and receive timely hangout invitations{" "}
              <span
                style={{
                  fontFamily: "var(--font-family-emoji)",
                  marginLeft: rem(2),
                }}
              >
                😎
              </span>
            </Text>
            <Text inherit fz="xs" c="dimmed">
              to enable push notifications, please go to your device settings
              and enable notifications for smaller world.
            </Text>
          </Stack>
        </Alert>
      )}
      <Box pos="relative">
        <UserPageFeed />
        {isStandalone &&
          !outOfPWAScope &&
          pushRegistration === null &&
          webPushSupported !== false &&
          webPushPermission !== "denied" && (
            <>
              <SingleDayFontHead />
              <Overlay backgroundOpacity={0} blur={3}>
                <Group justify="center" align="end" gap="xs">
                  <Text className={classes.notificationsRequiredIndicatorText}>
                    help {user.name} stay connected with you 🫶
                  </Text>
                  <Image
                    src={swirlyUpArrowSrc}
                    className={classes.notificationsRequiredIndicatorArrow}
                  />
                </Group>
              </Overlay>
            </>
          )}
      </Box>
    </Stack>
  );
  return (
    <>
      <RemoveScroll
        enabled={
          isStandalone &&
          !outOfPWAScope &&
          !pushRegistration &&
          webPushSupported !== false &&
          webPushPermission !== "denied"
        }
      >
        {body}
      </RemoveScroll>
      {isStandalone && !outOfPWAScope && (
        <>
          <UserPageFloatingActions />
          {currentFriend && pushRegistration && (
            <WelcomeBackToast subject={currentFriend} />
          )}
        </>
      )}
      {(isStandalone === false || outOfPWAScope) && (
        <>
          {currentFriend ? (
            <UserPageInstallAlert {...{ currentFriend }} />
          ) : (
            <UserPageRequestInvitationAlert />
          )}
        </>
      )}
    </>
  );
};

UserPage.layout = page => (
  <AppLayout<UserPageProps>
    title={({ user }) => `${possessive(user.name)} world`}
    manifestUrl={({ currentFriend, user }, { url }) => {
      const { manifest_icon_type } = queryParamsFromPath(url);
      return currentFriend
        ? routes.users.manifest.path({
            id: user.handle,
            query: {
              friend_token: currentFriend.access_token,
              icon_type: manifest_icon_type,
            },
          })
        : null;
    }}
    pwaScope={({ user }) =>
      withTrailingSlash(routes.users.show.path({ id: user.id }))
    }
    withContainer
    containerSize="xs"
    withGutter
  >
    <UserPageDialogStateProvider>{page}</UserPageDialogStateProvider>
    {/* <Oneko targetSelector=".PostCard, #upcoming-events" /> */}
  </AppLayout>
);

export default UserPage;
