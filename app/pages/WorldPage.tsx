import { Avatar, Image, Indicator, Overlay, Text } from "@mantine/core";

import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";

import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AddFriendButton from "~/components/AddFriendButton";
import AppLayout from "~/components/AppLayout";
import WorldPageEnableNotificationsActionIcon from "~/components/WorldPageEnableNotificationsActionIcon";
import WorldPageFeed from "~/components/WorldPageFeed";
import WorldPageFloatingActions from "~/components/WorldPageFloatingActions";
import WorldPageNotificationsButton from "~/components/WorldPageNotificationsButton";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { isMobileSafari, useBrowserDetection } from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa";
import { useWebPush } from "~/helpers/webPush";
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
  friends,
  pendingJoinRequests,
}) => {
  const browserDetection = useBrowserDetection();
  const isStandalone = useIsStandalone();
  const user = useAuthenticatedUser();
  const { registration } = useWebPush();

  // == Add to home screen
  const { install } = useInstallPrompt();

  return (
    <>
      <Stack gap="lg">
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
                {possessive(user.name)} world
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
                          {friends.map(({ id, emoji }) => (
                            <Avatar key={id} size="sm">
                              {emoji ? (
                                <Text fz="md">{emoji}</Text>
                              ) : (
                                <Box component={UserIcon} fz="sm" c="white" />
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
                {isStandalone === false &&
                  (!!install ||
                    (browserDetection &&
                      isMobileSafari(browserDetection.browser))) && (
                    <WorldPageEnableNotificationsActionIcon {...{ user }} />
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
                href={routes.signup.edit.path()}
              >
                customize your page
              </Menu.Item>
              <Menu.Item
                component="a"
                leftSection={<OpenExternalIcon />}
                href={routes.users.show.path({ handle: user.handle })}
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
              <AddFriendButton variant="white" size="compact-sm" />
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
