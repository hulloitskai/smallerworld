import { Image, Overlay, Popover, RemoveScroll, Text } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import { useModals } from "@mantine/modals";

import logoSrc from "~/assets/images/logo.png";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import WelcomeBackToast from "~/components/WelcomeBackToast";
import WorldPageDialogStateProvider from "~/components/WorldPageDialogStateProvider";
import WorldPageFeed from "~/components/WorldPageFeed";
import WorldPageFloatingActions from "~/components/WorldPageFloatingActions";
import WorldPageInstallAlert from "~/components/WorldPageInstallAlert";
import WorldPageInvitationsButton from "~/components/WorldPageInvitationsButton";
import WorldPageJoinRequestAlert from "~/components/WorldPageJoinRequestAlert";
import WorldPageNotificationsButtonCard from "~/components/WorldPageNotificationsButtonCard";
import WorldPageRefreshButton from "~/components/WorldPageRefreshButton";
import { openWorldPageInstallModal } from "~/helpers/install";
import { useWebPush } from "~/helpers/webPush";
import { WORLD_ICON_RADIUS_RATIO, type WorldPageProps } from "~/helpers/worlds";

import classes from "./WorldPage.module.css";

const WORLD_ICON_SIZE = 96;

const WorldPage: PageComponent<WorldPageProps> = ({ world }) => {
  const worldTheme = useWorldTheme(world.theme);

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
    if (isStandalone && !outOfPWAScope) {
      router.reload({ async: true });
    }
  });

  // == Auto-open install modal
  const { modals } = useModals();
  useEffect(() => {
    const { intent } = queryParamsFromPath(location.href);
    if (
      intent === "install" &&
      isEmpty(modals) &&
      !matchMedia("(display-mode: standalone)").matches &&
      currentFriend
    ) {
      openWorldPageInstallModal(world);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const body = (
    <Stack>
      {currentUser?.id === world.owner_id && !currentFriend && (
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
              href={withTrailingSlash(routes.userWorld.show.path())}
              variant="white"
              leftSection={<BackIcon />}
              style={{ flexShrink: 0 }}
              mt={4}
            >
              back to your world
            </Button>
          </Group>
        </Alert>
      )}
      <Box pos="relative">
        <Stack gap="sm">
          <Image
            className={classes.worldIcon}
            src={world.icon.src}
            {...(!!world.icon.srcset && { srcSet: world.icon.srcset })}
            w={WORLD_ICON_SIZE}
            h={WORLD_ICON_SIZE}
            radius={WORLD_ICON_SIZE / WORLD_ICON_RADIUS_RATIO}
            {...(currentFriend && {
              onClick: () => {
                const pageUrl = normalizeUrl(
                  routes.worlds.show.path({
                    id: world.handle,
                    query: {
                      friend_token: currentFriend.access_token,
                    },
                  }),
                );
                void navigator.clipboard.writeText(pageUrl).then(() => {
                  toast.success("world url copied");
                });
              },
            })}
          />
          <Stack gap={4}>
            <Title size="h2" ta="center" lh="xs">
              {world.name}
            </Title>
            {!currentFriend ? null : isStandalone === undefined ? (
              <Skeleton style={{ alignSelf: "center", width: "unset" }}>
                <Button style={{ visibility: "hidden" }}>
                  some placeholder
                </Button>
              </Skeleton>
            ) : isStandalone &&
              !outOfPWAScope &&
              webPushPermission !== "denied" ? (
              <Group gap="xs" justify="center">
                <WorldPageNotificationsButtonCard {...{ currentFriend }} />
                {pushRegistration && (
                  <WorldPageRefreshButton
                    {...(worldTheme === "bakudeku" && {
                      variant: "filled",
                    })}
                  />
                )}
              </Group>
            ) : (
              <Group gap="xs" justify="center">
                <WorldPageInvitationsButton
                  {...(worldTheme === "bakudeku" && {
                    variant: "filled",
                  })}
                />
                {isStandalone && !outOfPWAScope && (
                  <WorldPageRefreshButton
                    {...(worldTheme === "bakudeku" && {
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
                    href={routes.sessions.new.path()}
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
              enable notifications to be a part of {world.name} support system,
              and receive timely hangout invitations{" "}
              <span className={classes.pushNotificationsDisabledAlertEmoji}>
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
        <WorldPageFeed />
        {isStandalone &&
          !outOfPWAScope &&
          pushRegistration === null &&
          webPushSupported !== false &&
          webPushPermission !== "denied" && (
            <Overlay backgroundOpacity={0} blur={3}>
              <Group justify="center" align="end" gap="xs">
                <Text className={classes.notificationsRequiredIndicatorText}>
                  help {world.owner_name} stay connected with you 🫶
                </Text>
                <Image
                  src={swirlyUpArrowSrc}
                  className={classes.notificationsRequiredIndicatorArrow}
                />
              </Group>
            </Overlay>
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
          <WorldPageFloatingActions />
          {currentFriend && pushRegistration && (
            <WelcomeBackToast subject={currentFriend} />
          )}
        </>
      )}
      {(isStandalone === false || outOfPWAScope) && (
        <>
          {currentFriend ? (
            <WorldPageInstallAlert />
          ) : (
            <WorldPageJoinRequestAlert />
          )}
        </>
      )}
    </>
  );
};

WorldPage.layout = page => (
  <AppLayout<WorldPageProps>
    title={({ world }) => world.name}
    manifestUrl={({ currentFriend, world }, { url }) => {
      const { manifest_icon_type } = queryParamsFromPath(url);
      return currentFriend
        ? routes.worldManifests.show.path({
            world_id: world.id,
            query: {
              friend_token: currentFriend.access_token,
              icon_type: manifest_icon_type,
            },
          })
        : null;
    }}
    pwaScope={({ world }) =>
      withTrailingSlash(routes.worlds.show.path({ id: world.handle }))
    }
    withContainer
    containerSize="xs"
    withGutter
  >
    <WorldPageDialogStateProvider>{page}</WorldPageDialogStateProvider>
  </AppLayout>
);

export default WorldPage;
