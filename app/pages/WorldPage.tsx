import { Avatar, Image, Indicator, Overlay, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";

import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import WorldPageFeed from "~/components/WorldPageFeed";
import WorldPageFloatingActions from "~/components/WorldPageFloatingActions";
import { openWorldPageInstallationInstructionsModal } from "~/components/WorldPageInstallationInstructionsModal";
import { openWorldPageInstallModal } from "~/components/WorldPageInstallModal";
import WorldPageNotificationsButton from "~/components/WorldPageNotificationsButton";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { isDesktop, useBrowserDetection } from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa/install";
import {
  useReregisterWithDeviceIdentifiers,
  useWebPush,
} from "~/helpers/webPush";
import { type FriendInfo, type User } from "~/types";

import classes from "./WorldPage.module.css";

export interface WorldPageProps extends SharedPageProps {
  currentUser: User;
  faviconSrc: string;
  faviconImageSrc: string;
  appleTouchIconSrc: string;
  friends: FriendInfo[];
  pendingJoinRequests: number;
}

const ICON_SIZE = 96;

const WorldPage: PageComponent<WorldPageProps> = ({
  currentUser,
  friends,
  pendingJoinRequests,
}) => {
  // TODO: Remove after April 15, 2025
  useReregisterWithDeviceIdentifiers();

  const isStandalone = useIsStandalone();
  const { registration, subscription } = useWebPush();

  // == User theme
  useUserTheme(currentUser.theme);

  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == Add to home screen
  const { install } = useInstallPrompt();

  // == Auto-open install modal on mobile
  const { intent } = useQueryParams();
  const { modals } = useModals();
  useEffect(() => {
    if (isStandalone === undefined || !isEmpty(modals)) {
      return;
    }
    if (intent === "installation_instructions") {
      openWorldPageInstallationInstructionsModal({ currentUser });
    } else if (
      intent === "install" ||
      (!isStandalone &&
        !!browserDetection &&
        (!!install || !isDesktop(browserDetection)))
    ) {
      openWorldPageInstallModal({
        currentUser,
        onInstalled: () => {
          const url = new URL(location.href);
          const { searchParams } = url;
          searchParams.delete("intent");
          url.search = searchParams.toString();
          void router.replace({ url: url.toString() });
        },
      });
    }
  }, [isStandalone, browserDetection, install]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Stack gap="lg">
        <Box pos="relative">
          <Stack gap="sm">
            <Image
              src={currentUser.page_icon.src}
              srcSet={currentUser.page_icon.src_set}
              w={ICON_SIZE}
              h={ICON_SIZE}
              fit="cover"
              radius={ICON_SIZE / APPLE_ICON_RADIUS_RATIO}
              style={{
                alignSelf: "center",
                flex: "unset",
                boxShadow: "var(--mantine-shadow-lg)",
              }}
            />
            <Stack gap={4}>
              <Title size="h2" lh="xs" ta="center">
                {possessive(currentUser.name)} world
              </Title>
              <Group gap={8} justify="center">
                {registration === undefined || subscription === undefined ? (
                  <Skeleton radius="xl" style={{ width: "unset" }}>
                    <Button radius="xl">your friends</Button>
                  </Skeleton>
                ) : (
                  <>
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
                                    <Box
                                      component={UserIcon}
                                      fz="sm"
                                      c="white"
                                    />
                                  )}
                                </Avatar>
                              ))}
                            </Avatar.Group>
                          ) : (
                            <FriendsIcon />
                          )
                        }
                      >
                        your friends
                      </Button>
                    )}
                  </>
                )}
                {isStandalone && <WorldPageNotificationsButton />}
              </Group>
            </Stack>
          </Stack>
          <Menu width={220} position="bottom-end" arrowOffset={16}>
            <Menu.Target>
              <ActionIcon
                pos="absolute"
                top={-6}
                right={0}
                className={classes.menuButton}
              >
                <Indicator
                  className={classes.menuIndicator}
                  label={pendingJoinRequests}
                  size={16}
                  offset={-4}
                  disabled={!pendingJoinRequests}
                >
                  <MenuIcon />
                </Indicator>
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                component={Link}
                leftSection={<EditIcon />}
                href={routes.world.edit.path()}
              >
                customize your page
              </Menu.Item>
              <Menu.Item
                component="a"
                leftSection={<OpenExternalIcon />}
                href={routes.users.show.path({ handle: currentUser.handle })}
                target="_blank"
              >
                view public profile
              </Menu.Item>
              <Menu.Item
                component={Link}
                className={classes.joinRequestMenuItem}
                leftSection={<JoinRequestsIcon />}
                href={routes.joinRequests.index.path()}
                {...(pendingJoinRequests > 0 && {
                  rightSection: (
                    <Badge variant="filled" px={6} py={0}>
                      {pendingJoinRequests}
                    </Badge>
                  ),
                })}
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
              <AddFriendButton
                {...{ currentUser }}
                variant="white"
                size="compact-sm"
              />
            </Group>
          </Alert>
        )}
        <Box pos="relative">
          <WorldPageFeed />
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
    imageUrl={({ faviconImageSrc }) => faviconImageSrc}
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
