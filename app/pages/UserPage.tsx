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
import { openUserPageJoinModal } from "~/components/UserPageJoinModal";
import UserPageNotificationsButtonCard from "~/components/UserPageNotificationsButtonCard";
import UserPageRefreshButton from "~/components/UserPageRefreshButton";
import { UserPageRequestInvitationAlert } from "~/components/UserPageRequestInvitationAlert";
import WelcomeBackToast from "~/components/WelcomeBackToast";
import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { useWebPush } from "~/helpers/webPush";
import { type Encouragement, type User } from "~/types";

import classes from "./UserPage.module.css";

export interface UserPageProps extends SharedPageProps {
  user: User;
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
  const { pushRegistration, supported: webPushSupported } = useWebPush();

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
  useUserTheme(user.theme);

  // == Auto-open join modal
  const params = useQueryParams();
  const { modals } = useModals();
  useEffect(() => {
    if (!isEmpty(modals) || !currentFriend) {
      return;
    }
    if (params.intent === "join") {
      openUserPageJoinModal({ user, currentFriend });
    } else if (params.intent === "installation_instructions") {
      openUserPageInstallationInstructionsModal({ user });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const body = (
    <Stack>
      {currentUser?.id === user.id && !params.friend_token && (
        <Alert
          mb="xl"
          styles={{
            root: { alignSelf: "stretch" },
            body: { rowGap: rem(4) },
          }}
        >
          <Group gap="xs" justify="space-between">
            <Group align="start" gap={8}>
              <Box component={PublicIcon} style={{ flexShrink: 0 }} mt={4} />
              <Text ff="heading" fw={700}>
                your public profile
              </Text>
            </Group>
            <Button
              component={Link}
              href={routes.world.show.path()}
              variant="white"
              leftSection={<BackIcon />}
              style={{ flexShrink: 0 }}
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
            <Title className={classes.pageTitle} size="h2">
              {possessive(user.name)} world
            </Title>
            {isStandalone && !outOfPWAScope ? (
              <>
                {currentFriend && (
                  <Group gap="xs" justify="center">
                    <UserPageNotificationsButtonCard {...{ currentFriend }} />
                    {pushRegistration && (
                      <UserPageRefreshButton userId={user.id} />
                    )}
                  </Group>
                )}
              </>
            ) : isStandalone === false || outOfPWAScope ? (
              <Group justify="center" gap={8}>
                <UserPageInvitationsButton />
              </Group>
            ) : (
              <Skeleton style={{ alignSelf: "center", width: "unset" }}>
                <Button>some placeholder</Button>
              </Skeleton>
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
                  href="/feedback"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  size="xs"
                  inline
                  ta="center"
                  ff="heading"
                >
                  got feedback or feature requests?
                </Anchor>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
      </Box>
      <Box pos="relative">
        <UserPageFeed />
        {isStandalone && !outOfPWAScope && pushRegistration === null && (
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
          webPushSupported !== false
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
          {currentFriend && <UserPageInstallAlert {...{ currentFriend }} />}
          {!currentFriend && <UserPageRequestInvitationAlert />}
        </>
      )}
    </>
  );
};

UserPage.layout = page => (
  <AppLayout<UserPageProps>
    title={({ user, currentFriend }, { url }) => {
      const { intent } = queryParamsFromPath(url);
      return currentFriend && intent === "join"
        ? `you're invited to ${possessive(user.name)} world`
        : `${possessive(user.name)} world`;
    }}
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
    pwaScope={({ user }) => routes.users.show.path({ id: user.id })}
    withContainer
    containerSize="xs"
    withGutter
  >
    <UserPageDialogStateProvider>{page}</UserPageDialogStateProvider>
    {/* <Oneko targetSelector=".PostCard, #upcoming-events" /> */}
  </AppLayout>
);

export default UserPage;
