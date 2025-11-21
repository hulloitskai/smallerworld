import { type InertiaLinkProps } from "@inertiajs/react";
import {
  Avatar,
  Image,
  Indicator,
  type ListItemProps,
  Loader,
  type MenuItemProps,
  Overlay,
  RemoveScroll,
  Text,
} from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import { useModals } from "@mantine/modals";

import EllipsisHorizontalIcon from "~icons/heroicons/ellipsis-horizontal-20-solid";
import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";
import HeartIcon from "~icons/heroicons/heart-20-solid";
import AddFriendIcon from "~icons/heroicons/user-plus-20-solid";

import logoSrc from "~/assets/images/logo.png";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import CreateInvitationDrawer from "~/components/CreateInvitationDrawer";
import UserWorldPageFeed from "~/components/UserWorldPageFeed";
import UserWorldPageFloatingActions from "~/components/UserWorldPageFloatingActions";
import UserWorldPageNotificationsButton from "~/components/UserWorldPageNotificationsButton";
import WelcomeBackToast from "~/components/WelcomeBackToast";
import WorldFooter from "~/components/WorldFooter";
import { useBrowserDetection } from "~/helpers/browsers";
import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { openUserWorldPageInstallModal } from "~/helpers/install";
import {
  useUserWorldPosts,
  worldManifestUrlForUser,
} from "~/helpers/userWorld";
import { useWebPush } from "~/helpers/webPush";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { useWorldTheme } from "~/helpers/worldThemes";
import { type User, type World } from "~/types";

import classes from "./UserWorldPage.module.css";

export interface UserWorldPageProps extends SharedPageProps {
  currentUser: User;
  world: World;
  latestFriendEmojis: (string | null)[];
  pendingJoinRequests: number;
  pendingInvitations: number;
}

const ICON_SIZE = 96;

const UserWorldPage: PageComponent<UserWorldPageProps> = ({
  currentUser,
  world,
  latestFriendEmojis,
  pendingJoinRequests,
  pendingInvitations,
}) => {
  const worldTheme = useWorldTheme(world.theme);

  const { isStandalone, outOfPWAScope } = usePWA();
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
        "world",
        "pendingJoinRequests",
        "latestFriendEmojis",
      ],
      async: true,
    });
  });

  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == PWA installation
  const { install: installPWA } = usePWA();

  // == Auto-open install modal on mobile
  const { modals } = useModals();
  useEffect(() => {
    const { intent } = queryParamsFromPath(location.href);
    if (isEmpty(modals) && isStandalone === false && intent === "install") {
      openUserWorldPageInstallModal(world);
    }
  }, [isStandalone, browserDetection, installPWA]); // eslint-disable-line react-hooks/exhaustive-deps

  // == Posts
  const { posts } = useUserWorldPosts();
  const hasOneUserCreatedPost = useMemo<boolean | undefined>(() => {
    if (posts) {
      const accountCreatedAt = DateTime.fromISO(currentUser.created_at);
      const cutoff = accountCreatedAt.plus({ seconds: 1 });
      return posts.some(post => {
        const updatedAt = DateTime.fromISO(post.updated_at);
        return updatedAt > cutoff;
      });
    }
  }, [posts]); // eslint-disable-line react-hooks/exhaustive-deps

  // == Search
  const [searchActive, setSearchActive] = useState(false);

  // == Add friend modal
  const [addFriendModalOpened, setAddFriendModalOpened] = useState(false);

  // == Link items
  interface LinkItemProps
    extends MenuItemProps,
      Omit<InertiaLinkProps, "color" | "style"> {}
  const LinkItem: FC<LinkItemProps> = props => (
    <Menu.Item component={Link} {...props} />
  );

  const body = (
    <Stack gap="lg">
      <Box pos="relative">
        <Stack gap="sm">
          <Image
            className={classes.pageIcon}
            src={world.icon.src}
            {...(!!world.icon.srcset && {
              srcSet: world.icon.srcset,
            })}
            w={ICON_SIZE}
            h={ICON_SIZE}
            radius={ICON_SIZE / WORLD_ICON_RADIUS_RATIO}
            onClick={() => {
              const worldPath = withTrailingSlash(
                routes.worlds.show.path({
                  id: world.id,
                }),
              );
              const worldUrl = normalizeUrl(worldPath);
              void navigator.clipboard.writeText(worldUrl).then(() => {
                toast.success("page url copied");
              });
            }}
          />
          <Stack gap={4}>
            <Title className={classes.pageTitle} size="h2">
              {world.name}
            </Title>
            <Group gap="xs" justify="center">
              {(!isStandalone ||
                outOfPWAScope ||
                pushRegistration !== null ||
                webPushSupported === false ||
                webPushPermission === "denied") && (
                <>
                  <Transition
                    transition="slide-up"
                    mounted={world.search_enabled && !searchActive}
                  >
                    {transitionStyle => (
                      <ActionIcon
                        size="lg"
                        variant="light"
                        style={transitionStyle}
                        onClick={() => {
                          setSearchActive(true);
                        }}
                        {...(worldTheme === "bakudeku" && {
                          variant: "filled",
                        })}
                      >
                        <SearchIcon />
                      </ActionIcon>
                    )}
                  </Transition>
                  <Button
                    component={Link}
                    href={routes.userWorldFriends.index.path()}
                    {...(worldTheme === "bakudeku" && {
                      variant: "filled",
                    })}
                    leftSection={
                      !isEmpty(latestFriendEmojis) ? (
                        <Avatar.Group className={classes.avatarGroup}>
                          {latestFriendEmojis.map((emoji, index) => (
                            <Avatar key={index} size="sm">
                              {emoji ? (
                                <Box className={classes.friendEmoji}>
                                  {emoji}
                                </Box>
                              ) : (
                                <Box
                                  component={UserIcon}
                                  className={classes.friendIcon}
                                />
                              )}
                            </Avatar>
                          ))}
                        </Avatar.Group>
                      ) : (
                        <AddFriendIcon />
                      )
                    }
                    className={classes.friendButton}
                    onClick={event => {
                      if (isEmpty(latestFriendEmojis)) {
                        event.preventDefault();
                        setAddFriendModalOpened(true);
                      }
                    }}
                  >
                    {!isEmpty(latestFriendEmojis)
                      ? "your friends"
                      : "add a friend!"}
                  </Button>
                </>
              )}
              {isStandalone && !outOfPWAScope && (
                <UserWorldPageNotificationsButton
                  {...(worldTheme === "bakudeku" && {
                    variant: "filled",
                  })}
                />
              )}
            </Group>
            <Transition
              mounted={isEmpty(latestFriendEmojis) && pendingInvitations > 0}
            >
              {transitionStyle => (
                <Badge
                  leftSection={<InvitationIcon />}
                  variant="transparent"
                  style={[{ alignSelf: "center" }, transitionStyle]}
                >
                  <Anchor
                    component={Link}
                    href={routes.userWorldInvitations.index.path()}
                    inherit
                    c="inherit"
                  >
                    {pendingInvitations} recently sent{" "}
                    {inflect("invitation", pendingInvitations)}
                  </Anchor>
                </Badge>
              )}
            </Transition>
          </Stack>
        </Stack>
        <Group
          pos="absolute"
          top={pendingJoinRequests > 0 ? 0 : -6}
          right={0}
          gap={2}
          align="start"
        >
          {!currentUser.membership_tier && <SupportButton />}
          <Menu width={228} position="bottom-end" arrowOffset={20}>
            <Menu.Target>
              <ActionIcon className={classes.menuButton}>
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
              <LinkItem
                leftSection={<EditIcon />}
                href={routes.userWorld.edit.path()}
              >
                customize your page
              </LinkItem>
              <LinkItem
                leftSection={<OpenExternalIcon />}
                href={withTrailingSlash(
                  routes.worlds.show.path({ id: world.handle }),
                )}
              >
                view public profile
              </LinkItem>
              <LinkItem
                className={classes.joinRequestMenuItem}
                leftSection={<JoinRequestIcon />}
                href={routes.userWorldJoinRequests.index.path()}
                {...(pendingJoinRequests > 0 && {
                  rightSection: (
                    <Badge variant="filled" px={6} py={0}>
                      {pendingJoinRequests}
                    </Badge>
                  ),
                })}
              >
                view join requests
              </LinkItem>
              {isStandalone && <LogoutItem worldHandle={world.handle} />}
              <Menu.Divider />
              <Menu.Item
                component="div"
                disabled
                className={classes.menuContactItem}
              >
                <Anchor
                  href={routes.feedback.redirect.path()}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  size="xs"
                  inline
                  data-canny-link
                >
                  got feedback or feature requests?
                </Anchor>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
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
              you won&apos;t know when friends send you writing prompts or react
              to your posts{" "}
              <span className={classes.pushNotificationsDisabledAlertEmoji}>
                😢
              </span>
            </Text>
            <Text inherit fz="xs" c="dimmed">
              to enable push notifications, please go to your device settings
              and enable notifications for smaller world.
            </Text>
          </Stack>
        </Alert>
      )}
      {(!isStandalone ||
        outOfPWAScope ||
        pushRegistration !== null ||
        webPushPermission === "denied") &&
        (hasOneUserCreatedPost === false || latestFriendEmojis.length < 3) && (
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
                  latestFriendEmojis.length >= 3
                    ? true
                    : isEmpty(latestFriendEmojis)
                      ? false
                      : "partial"
                }
              >
                invite{" "}
                <span
                  style={{
                    ...(!isEmpty(latestFriendEmojis) &&
                      latestFriendEmojis.length < 3 && {
                        opacity: 0.5,
                        textDecoration: "line-through",
                      }),
                  }}
                >
                  3 friends
                </span>{" "}
                <span
                  style={{
                    fontWeight: 500,
                    ...(isEmpty(latestFriendEmojis) &&
                      latestFriendEmojis.length < 3 && {
                        display: "none",
                      }),
                  }}
                >
                  {3 - latestFriendEmojis.length} more{" "}
                  {inflect("friend", 3 - latestFriendEmojis.length)}{" "}
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
        <UserWorldPageFeed
          {...{ showSearch: searchActive }}
          hideSearch={() => {
            setSearchActive(false);
          }}
        />
        {isStandalone &&
          !outOfPWAScope &&
          pushRegistration === null &&
          webPushSupported !== false &&
          webPushPermission !== "denied" && (
            <Overlay backgroundOpacity={0} blur={3}>
              <Group justify="center" align="end" gap="xs">
                <Text className={classes.notificationsRequiredIndicatorText}>
                  pretty&nbsp;please? 👉&#8288;👈
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
      <UserWorldPageFloatingActions
        onPostCreated={() => {
          scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      {isStandalone && !outOfPWAScope && pushRegistration && (
        <WelcomeBackToast subject={currentUser} />
      )}
      <CreateInvitationDrawer
        opened={addFriendModalOpened}
        onClose={() => {
          setAddFriendModalOpened(false);
        }}
        onInvitationCreated={() => {
          router.reload({
            only: ["latestFriendEmojis"],
            async: true,
          });
        }}
      />
    </>
  );
};

const SupportButton: FC = () => {
  const [autoOpened, setAutoOpened] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const delay = 1400;
    const showTimeout = setTimeout(() => {
      setAutoOpened(true);
    }, delay);
    const hideTimeout = setTimeout(() => {
      setAutoOpened(false);
    }, delay + 2400);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  return (
    <Tooltip
      label="support smaller world!!"
      opened={hovered || autoOpened}
      position="bottom-end"
      arrowOffset={20}
      className={classes.supportTooltip}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      <ActionIcon
        component="a"
        href={routes.support.redirect.path()}
        className={classes.heartButton}
      >
        <HeartIcon />
      </ActionIcon>
    </Tooltip>
  );
};

UserWorldPage.layout = page => (
  <AppLayout<UserWorldPageProps>
    title="your world"
    manifestUrl={({ currentUser }) => worldManifestUrlForUser(currentUser)}
    withContainer
    containerSize="xs"
    withGutter
    footer={({ world }) => <WorldFooter world={world} />}
  >
    {page}
  </AppLayout>
);

export default UserWorldPage;

interface CheckableListItemProps extends Omit<ListItemProps, "icon"> {
  checked: boolean | "partial";
}

const CheckableListItem: FC<CheckableListItemProps> = ({
  className,
  checked,
  children,
  ...otherProps
}) => (
  <List.Item
    className={cn(classes.checkableListItem, className)}
    icon={
      <Checkbox
        checked={checked === true}
        {...(checked === "partial" && {
          indeterminate: true,
          icon: props => (
            <EllipsisHorizontalIcon {...omit(props, "indeterminate")} />
          ),
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

interface LogoutItemProps extends BoxProps {
  worldHandle: string;
}

const LogoutItem: FC<LogoutItemProps> = ({ worldHandle, ...otherProps }) => {
  // == Logout
  const { trigger, mutating } = useRouteMutation(routes.sessions.destroy, {
    descriptor: "sign out",
    onSuccess: () => {
      const worldPath = withTrailingSlash(
        routes.worlds.show.path({ id: worldHandle }),
      );
      location.href = worldPath;
    },
  });

  return (
    <Menu.Item
      pos="relative"
      leftSection={mutating ? <Loader size={12} /> : <SignOutIcon />}
      closeMenuOnClick={false}
      onClick={() => {
        void trigger();
      }}
      {...otherProps}
    >
      sign out
    </Menu.Item>
  );
};
