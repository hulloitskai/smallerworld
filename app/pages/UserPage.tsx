import { Image, Overlay, Popover, RemoveScroll, Text } from "@mantine/core";
import { useDocumentVisibility } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import { DateTime } from "luxon";

import logoSrc from "~/assets/images/logo.png";

import AppLayout from "~/components/AppLayout";
import UserPageDialogStateProvider from "~/components/UserPageDialogStateProvider";
import UserPageFeed from "~/components/UserPageFeed";
import UserPageFloatingActions from "~/components/UserPageFloatingActions";
import UserPageInstallAlert from "~/components/UserPageInstallAlert";
import { openUserPageInstallationInstructionsModal } from "~/components/UserPageInstallationInstructionsModal";
import UserPageNotificationsButtonCard from "~/components/UserPageNotificationsButtonCard";
import UserPageRefreshButton from "~/components/UserPageRefreshButton";
import { UserPageRequestInvitationAlert } from "~/components/UserPageRequestInvitationAlert";
import UserPageUpcomingEventsButton from "~/components/UserPageUpcomingEventsButton";
import { openUserPageWelcomeModal } from "~/components/UserPageWelcomeModal";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { useContact } from "~/helpers/contact";
import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { useResetPushSubscriptionOnIOS, useWebPush } from "~/helpers/webPush";
import { type Encouragement, type Friend, type User } from "~/types";

import classes from "./UserPage.module.css";

export interface UserPageProps extends SharedPageProps {
  user: User;
  replyPhoneNumber: string | null;
  lastSentEncouragement: Encouragement | null;
  invitationRequested: boolean;
}

const ICON_SIZE = 96;

const UserPage: PageComponent<UserPageProps> = ({ user }) => {
  const isStandalone = useIsStandalone();
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();
  const { registration } = useWebPush();

  // TODO: Remove after 2025-05-01
  useResetPushSubscriptionOnIOS();

  // == Reload user on visibility change
  const visibility = useDocumentVisibility();
  useDidUpdate(() => {
    if (visibility === "visible" && isStandalone) {
      void router.reload({
        only: [
          "currentUser",
          "currentFriend",
          "faviconLinks",
          "user",
          "lastSentEncouragement",
        ],
        async: true,
      });
    }
  }, [visibility]); // eslint-disable-line react-hooks/exhaustive-deps

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
      openUserPageWelcomeModal({
        user,
        currentFriend,
        onInstalled: () => {
          const url = new URL(location.href);
          const { searchParams } = url;
          searchParams.delete("intent");
          url.search = searchParams.toString();
          void router.replace({ url: url.toString() });
        },
      });
    } else if (intent === "installation_instructions") {
      openUserPageInstallationInstructionsModal({ user });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const body = (
    <Stack>
      {currentUser?.id === user.id && !currentFriend && (
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
            srcSet={user.page_icon.src_set}
            radius={ICON_SIZE / APPLE_ICON_RADIUS_RATIO}
            style={{ "--size": rem(ICON_SIZE) }}
          />
          <Stack gap={4}>
            <Title size="h2" lh="xs" ta="center" className={classes.pageTitle}>
              {possessive(user.name)} world
            </Title>
            {isStandalone ? (
              <>
                {currentFriend && (
                  <Group gap="xs" justify="center">
                    <UserPageNotificationsButtonCard {...{ currentFriend }} />
                    {registration && <UserPageRefreshButton userId={user.id} />}
                  </Group>
                )}
              </>
            ) : isStandalone === false ? (
              <UserPageUpcomingEventsButton style={{ alignSelf: "center" }} />
            ) : (
              <Skeleton style={{ alignSelf: "center", width: "unset" }}>
                <Button>some placeholder</Button>
              </Skeleton>
            )}
          </Stack>
        </Stack>
        <Popover position="bottom-end" arrowOffset={16}>
          <Popover.Target>
            <ActionIcon pos="absolute" top={0} right={0} size="lg">
              <Image src={logoSrc} h={26} w="unset" />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap={8}>
              <Text ta="center" ff="heading" fw={600}>
                wanna make your own smaller world?
              </Text>
              <CreateYourWorldButton />
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </Box>
      <Box pos="relative">
        <UserPageFeed />
        {isStandalone && registration === null && (
          <Overlay backgroundOpacity={0} blur={3}>
            <div className={classes.notificationsRequiredIndicatorArrow} />
          </Overlay>
        )}
      </Box>
    </Stack>
  );
  return (
    <>
      <RemoveScroll enabled={isStandalone && !registration}>
        {body}
      </RemoveScroll>
      {isStandalone && (
        <>
          <UserPageFloatingActions />
          {currentFriend && <WelcomeBackToast {...{ currentFriend }} />}
        </>
      )}
      {isStandalone === false && (
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
        ? `you're invited to ${user.name}'s world`
        : `${user.name}'s world`;
    }}
    manifestUrl={({ currentFriend, user }, { url }) => {
      const { manifest_icon_type } = queryParamsFromPath(url);
      return currentFriend
        ? routes.users.manifest.path({
            id: user.id,
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
    <UserPageDialogStateProvider>{page}</UserPageDialogStateProvider>
  </AppLayout>
);

export default UserPage;

interface WelcomeBackToastProps {
  currentFriend: Friend;
}

const WelcomeBackToast: FC<WelcomeBackToastProps> = ({ currentFriend }) => {
  const { registration } = useWebPush();
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
    if (!registration) {
      return;
    }
    if (visibility === "visible") {
      const friendName = [currentFriend.emoji, currentFriend.name]
        .filter(Boolean)
        .join(" ");
      const timeout = setTimeout(() => {
        toast(`welcome back, ${friendName}`, {
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

const CreateYourWorldButton: FC = () => {
  const [contact] = useContact({
    type: "sms",
    body: "hey i think this smaller world thing is dope. i want to be a beta user! my name is: ",
  });
  return (
    <Button
      leftSection="😍"
      styles={{ section: { fontSize: "var(--mantine-font-size-xl)" } }}
      onClick={() => {
        void contact();
      }}
    >
      create your world
    </Button>
  );
};
