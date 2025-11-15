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

import logoSrc from "~/assets/images/logo.png";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import CreateInvitationDrawer from "~/components/CreateInvitationDrawer";
import WelcomeBackToast from "~/components/WelcomeBackToast";
import WorldFooter from "~/components/WorldFooter";
import WorldPageFeed from "~/components/WorldPageFeed";
import WorldPageFloatingActions from "~/components/WorldPageFloatingActions";
import { openWorldPageInstallationInstructionsModal } from "~/components/WorldPageInstallationInstructionsModal";
import { openWorldPageInstallModal } from "~/components/WorldPageInstallModal";
import WorldPageNotificationsButton from "~/components/WorldPageNotificationsButton";
import { isDesktop, useBrowserDetection } from "~/helpers/browsers";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/users";
import { useWebPush } from "~/helpers/webPush";
import { manifestUrlForUser, useWorldPosts } from "~/helpers/world";
import { type User } from "~/types";

import classes from "./WorldPage.module.css";

export interface WorldPageProps extends SharedPageProps {
  currentUser: User;
  latestFriendEmojis: (string | null)[];
  pendingJoinRequests: number;
  hideStats: boolean;
  hideNeko: boolean;
}

const ICON_SIZE = 96;

const WorldPage: PageComponent<WorldPageProps> = ({
  currentUser,
  latestFriendEmojis,
  pendingJoinRequests,
}) => {
  const { isStandalone, outOfPWAScope } = usePWA();
  const userTheme = useUserTheme(currentUser.theme);
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
        "faviconLinks",
        "hideStats",
        "hideNeko",
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
  const queryParams = useQueryParams();
  const { modals } = useModals();
  useEffect(() => {
    if (isStandalone === undefined || !isEmpty(modals)) {
      return;
    }
    if (queryParams.intent === "installation_instructions") {
      openWorldPageInstallationInstructionsModal({ currentUser });
    } else if (
      queryParams.intent === "install" ||
      ((!isStandalone || outOfPWAScope) &&
        (installPWA || (browserDetection && !isDesktop(browserDetection))))
    ) {
      openWorldPageInstallModal({ currentUser });
    }
  }, [isStandalone, browserDetection, installPWA]); // eslint-disable-line react-hooks/exhaustive-deps

  // == Posts
  const { posts } = useWorldPosts();
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
            src={currentUser.page_icon.src}
            {...(!!currentUser.page_icon.srcset && {
              srcSet: currentUser.page_icon.srcset,
            })}
            w={ICON_SIZE}
            h={ICON_SIZE}
            radius={ICON_SIZE / USER_ICON_RADIUS_RATIO}
            onClick={() => {
              const pageUrl = normalizeUrl(
                withTrailingSlash(routes.world.show.path()),
              );
              void navigator.clipboard.writeText(pageUrl).then(() => {
                toast.success("page url copied");
              });
            }}
          />
          <Stack gap={4}>
            <Title className={classes.pageTitle} size="h2">
              {possessive(currentUser.name)} world
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
                    mounted={
                      currentUser.supported_features.includes("search") &&
                      !searchActive
                    }
                  >
                    {transitionStyle => (
                      <ActionIcon
                        size="lg"
                        variant="light"
                        style={transitionStyle}
                        onClick={() => {
                          setSearchActive(true);
                        }}
                        {...(userTheme === "bakudeku" && {
                          variant: "filled",
                        })}
                      >
                        <SearchIcon />
                      </ActionIcon>
                    )}
                  </Transition>
                  <Button
                    component={Link}
                    href={routes.worldFriends.index.path()}
                    {...(userTheme === "bakudeku" && {
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
                        <FriendsIcon />
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
                      : "invite a friend!"}
                  </Button>
                </>
              )}
              {isStandalone && !outOfPWAScope && (
                <WorldPageNotificationsButton
                  {...(userTheme === "bakudeku" && {
                    variant: "filled",
                  })}
                />
              )}
            </Group>
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
                href={routes.world.edit.path()}
              >
                customize your page
              </LinkItem>
              <LinkItem
                leftSection={<OpenExternalIcon />}
                href={withTrailingSlash(
                  routes.users.show.path({ id: currentUser.handle }),
                )}
              >
                view public profile
              </LinkItem>
              <LinkItem
                className={classes.joinRequestMenuItem}
                leftSection={<JoinRequestIcon />}
                href={routes.worldJoinRequests.index.path()}
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
              {isStandalone && <LogoutItem />}
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
        (hasOneUserCreatedPost === false ||
          (!!latestFriendEmojis && latestFriendEmojis.length < 3)) && (
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
        <WorldPageFeed
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
      <WorldPageFloatingActions
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
            only: ["latestFriends"],
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

WorldPage.layout = page => (
  <AppLayout<WorldPageProps>
    title="your world"
    manifestUrl={({ currentUser }) => manifestUrlForUser(currentUser)}
    withContainer
    containerSize="xs"
    withGutter
    footer={<WorldFooter />}
  >
    {page}
  </AppLayout>
);

export default WorldPage;

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

interface LogoutItemProps extends BoxProps {}

const LogoutItem: FC<LogoutItemProps> = ({ ...otherProps }) => {
  // == Logout
  const { trigger, mutating } = useRouteMutation(routes.sessions.destroy, {
    descriptor: "sign out",
    onSuccess: () => {
      const worldPath = withTrailingSlash(routes.world.show.path());
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
