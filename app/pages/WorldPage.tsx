import {
  Avatar,
  Image,
  Indicator,
  type ListItemProps,
  Overlay,
  RemoveScroll,
  Text,
} from "@mantine/core";
import { useModals } from "@mantine/modals";

import EllipsisHorizontalIcon from "~icons/heroicons/ellipsis-horizontal-20-solid";
import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";

import logoSrc from "~/assets/images/logo.png";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import WorldPageFeed from "~/components/WorldPageFeed";
import WorldPageFloatingActions from "~/components/WorldPageFloatingActions";
import { openWorldPageInstallationInstructionsModal } from "~/components/WorldPageInstallationInstructionsModal";
import { openWorldPageInstallModal } from "~/components/WorldPageInstallModal";
import WorldPageNotificationsButton from "~/components/WorldPageNotificationsButton";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { isDesktop, useBrowserDetection } from "~/helpers/browsers";
import { usePosts } from "~/helpers/posts";
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

  // == Tutorial alert
  const { posts } = usePosts();
  const hasOneUserCreatedPost = useMemo<boolean | undefined>(() => {
    if (posts) {
      const accountCreatedAt = DateTime.fromISO(currentUser.created_at);
      const cutoff = accountCreatedAt.plus({ seconds: 1 });
      return posts.some(post => {
        const postCreatedAt = DateTime.fromISO(post.created_at);
        return postCreatedAt > cutoff;
      });
    }
  }, [posts]); // eslint-disable-line react-hooks/exhaustive-deps

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
                                      className={classes.friendIcon}
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
                rel="noopener"
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
        {(!isStandalone || !!registration) &&
          (hasOneUserCreatedPost === false ||
            (!!friends && friends.length < 3)) && (
            <Alert
              className={classes.onboardingAlert}
              variant="outline"
              title={
                <Group gap={8}>
                  <Image src={logoSrc} w={20} />
                  <Text inherit mt={1}>
                    let&apos;s bring your world to life!
                  </Text>
                </Group>
              }
            >
              <List>
                <CheckableListItem
                  checked={
                    friends.length >= 3
                      ? true
                      : isEmpty(friends)
                        ? false
                        : "partial"
                  }
                >
                  invite{" "}
                  <span
                    style={{
                      ...(!isEmpty(friends) &&
                        friends.length < 3 && {
                          color: "var(--mantine-color-dimmed)",
                          textDecoration: "line-through",
                        }),
                    }}
                  >
                    3 friends
                  </span>{" "}
                  <span
                    style={{
                      fontWeight: 500,
                      ...(isEmpty(friends) &&
                        friends.length < 3 && {
                          display: "none",
                        }),
                    }}
                  >
                    {3 - friends.length} more{" "}
                    {inflect("friend", 3 - friends.length)}{" "}
                  </span>
                  to join your world 👯
                </CheckableListItem>
                <CheckableListItem checked={!!hasOneUserCreatedPost}>
                  write your first post! ✍️
                </CheckableListItem>
              </List>
            </Alert>
          )}
        <Box pos="relative">
          <WorldPageFeed />
          {isStandalone && registration === null && (
            <RemoveScroll>
              <Overlay backgroundOpacity={0} blur={3}>
                <Image
                  src={swirlyUpArrowSrc}
                  className={classes.notificationsRequiredIndicatorArrow}
                />
              </Overlay>
            </RemoveScroll>
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

interface CheckableListItemProps extends Omit<ListItemProps, "icon"> {
  checked: boolean | "partial";
}

const CheckableListItem: FC<CheckableListItemProps> = ({
  className,
  checked,
  children,
  ...otherProps
}) => {
  return (
    <List.Item
      className={cn(classes.checkableListItem, className)}
      icon={
        <Checkbox
          checked={checked === true}
          {...(checked === "partial" && {
            indeterminate: true,
            icon: EllipsisHorizontalIcon,
          })}
          radius="sm"
          readOnly
        />
      }
      mod={{ checked }}
      {...otherProps}
    >
      {children}
    </List.Item>
  );
};
