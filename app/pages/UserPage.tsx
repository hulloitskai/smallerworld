import { Image, Overlay, Popover, RemoveScroll, Text } from "@mantine/core";
import { useDocumentVisibility, useWindowEvent } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import { DateTime } from "luxon";

import logoSrc from "~/assets/images/logo.png";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import ContactLink from "~/components/ContactLink";
import SingleDayFontHead from "~/components/SingleDayFontHead";
import UserPageDialogStateProvider from "~/components/UserPageDialogStateProvider";
import UserPageFeed from "~/components/UserPageFeed";
import UserPageFloatingActions from "~/components/UserPageFloatingActions";
import UserPageInstallAlert from "~/components/UserPageInstallAlert";
import { openUserPageInstallationInstructionsModal } from "~/components/UserPageInstallationInstructionsModal";
import { openUserPageJoinModal } from "~/components/UserPageJoinModal";
import UserPageNotificationsButtonCard from "~/components/UserPageNotificationsButtonCard";
import UserPageRefreshButton from "~/components/UserPageRefreshButton";
import { UserPageRequestInvitationAlert } from "~/components/UserPageRequestInvitationAlert";
import UserPageUpcomingEventsButton from "~/components/UserPageUpcomingEventsButton";
import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { useWebPush } from "~/helpers/webPush";
import { type Encouragement, type Friend, type User } from "~/types";

import classes from "./UserPage.module.css";

export interface UserPageProps extends SharedPageProps {
  user: User;
  replyToNumber: string | null;
  lastSentEncouragement: Encouragement | null;
  invitationRequested: boolean;
}

const ICON_SIZE = 96;

const UserPage: PageComponent<UserPageProps> = ({ user }) => {
  const { isStandalone, outOfPWAScope } = usePWA();
  const params = useQueryParams();
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();
  const { registration: pushRegistration, supported: pushSupported } =
    useWebPush();

  // == Reload user on window focus
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
      ],
      async: true,
    });
  });

  // == User theme
  useUserTheme(user.theme);

  // == Auto-open join modal
  const { intent } = useQueryParams();
  const { modals } = useModals();
  useEffect(() => {
    if (!isEmpty(modals) || !currentFriend) {
      return;
    }
    if (intent === "join") {
      openUserPageJoinModal({ user, currentFriend });
    } else if (intent === "installation_instructions") {
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
                const path = routes.users.show.path({
                  handle: user.handle,
                  query: {
                    friend_token: currentFriend.access_token,
                  },
                });
                const url = new URL(path, location.origin);
                void navigator.clipboard.writeText(url.toString()).then(() => {
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
              <UserPageUpcomingEventsButton style={{ alignSelf: "center" }} />
            ) : (
              <Skeleton style={{ alignSelf: "center", width: "unset" }}>
                <Button>some placeholder</Button>
              </Skeleton>
            )}
          </Stack>
        </Stack>
        <Popover position="bottom-end" arrowOffset={16} width={220}>
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
              <Divider mt={4} />
              <ContactLink
                type="sms"
                body="so about this smaller world thing... "
                size="xs"
                inline
              >
                got questions or feedback?
              </ContactLink>
            </Stack>
          </Popover.Dropdown>
        </Popover>
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
          pushSupported !== false
        }
      >
        {body}
      </RemoveScroll>
      {isStandalone && !outOfPWAScope && (
        <>
          <UserPageFloatingActions />
          {currentFriend && <WelcomeBackToast {...{ currentFriend }} />}
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
            handle: user.handle,
            query: {
              friend_token: currentFriend.access_token,
              icon_type: manifest_icon_type,
            },
          })
        : null;
    }}
    withContainer
    containerSize="xs"
    withGutter
  >
    <PWAScopeHead />
    <UserPageDialogStateProvider>{page}</UserPageDialogStateProvider>
  </AppLayout>
);

export default UserPage;

interface WelcomeBackToastProps {
  currentFriend: Friend;
}

const WelcomeBackToast: FC<WelcomeBackToastProps> = ({ currentFriend }) => {
  const { registration: pushRegistration } = useWebPush();
  const visibility = useDocumentVisibility();
  const lastCheckedRef = useRef<DateTime | null>(null);
  useEffect(() => {
    if (visibility === "hidden") {
      return;
    }
    if (lastCheckedRef.current && lastCheckedRef.current.diffNow().hours < 1) {
      return;
    }
    lastCheckedRef.current = DateTime.now();
    if (!pushRegistration) {
      return;
    }
    if (visibility === "visible") {
      const friendName = [currentFriend.emoji, currentFriend.name]
        .filter(Boolean)
        .join(" ");
      const timeout = setTimeout(() => {
        toast(`welcome back, ${friendName}`, {
          ...(!currentFriend.emoji && { icon: "❤️" }),
          className: classes.welcomeBackToast,
          closeButton: false,
          duration: 2400,
          position: "bottom-center",
        });
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [visibility]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const PWAScopeHead: FC = () => {
  const { user } = usePageProps<UserPageProps>();
  return (
    <Head>
      <meta
        name="pwa-scope"
        content={routes.users.show.path({ handle: user.handle })}
      />
    </Head>
  );
};
