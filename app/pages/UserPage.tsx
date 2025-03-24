import { ActionIcon, Image, Overlay, Popover, Text } from "@mantine/core";
import { useDocumentVisibility } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import { DateTime } from "luxon";
import { mutate } from "swr";

import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import FriendPostCardActions from "~/components/FriendPostCardActions";
import LoadMoreButton from "~/components/LoadMoreButton";
import PostCard from "~/components/PostCard";
import UserPageInstallAlert from "~/components/UserPageInstallAlert";
import { openUserPageInstallationInstructionsModal } from "~/components/UserPageInstallationInstructionsModal";
import UserPageNotificationsButton from "~/components/UserPageNotificationsButton";
import UserPagePinnedPosts from "~/components/UserPagePinnedPosts";
import { UserPageRequestInvitationAlert } from "~/components/UserPageRequestInvitationAlert";
import { openUserPageWelcomeModal } from "~/components/UserPageWelcomeModal";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { useUserPagePosts } from "~/helpers/userPages";
import { useWebPush } from "~/helpers/webPush";
import { type FriendNotificationSettings, type User } from "~/types";

import classes from "./UserPage.module.css";

export interface UserPageProps extends SharedPageProps {
  user: User;
  friendNotificationSettings: FriendNotificationSettings | null;
  replyPhoneNumber: string | null;
  faviconSrc: string;
  faviconImageSrc: string;
  appleTouchIconSrc: string;
}

const ICON_SIZE = 96;

const UserPage: PageComponent<UserPageProps> = ({ user, replyPhoneNumber }) => {
  const isStandalone = useIsStandalone();
  const currentFriend = useCurrentFriend();
  const { registration } = useWebPush();
  const { modals } = useModals();
  const { intent } = useQueryParams();

  useEffect(() => {
    if (!isEmpty(modals) || !currentFriend) {
      return;
    }
    if (intent === "join") {
      openUserPageWelcomeModal({ user });
    } else if (intent === "installation_instructions") {
      openUserPageInstallationInstructionsModal({ user });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Stack>
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
                {user.name}&apos;s world
              </Title>
              {currentFriend && isStandalone && (
                <Group gap="xs">
                  <UserPageNotificationsButton />
                  {registration && <RefreshPostsButton userId={user.id} />}
                </Group>
              )}
            </Stack>
          </Stack>
          <Popover>
            <Popover.Target>
              <ActionIcon pos="absolute" top={-6} right={0}>
                <SmallerWorldIcon />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap={8}>
                <Text ta="center" ff="heading" fw={600}>
                  wanna make your own smaller world?
                </Text>
                <Button
                  component="a"
                  target="_blank"
                  href={routes.login.new.path()}
                  leftSection={<OpenExternalIcon />}
                  style={{ alignSelf: "center" }}
                >
                  create your world
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Box>
        <Box pos="relative">
          <Feed {...{ user, replyPhoneNumber }} />
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
      {currentFriend ? (
        <UserPageInstallAlert {...{ user }} />
      ) : (
        <UserPageRequestInvitationAlert {...{ user }} />
      )}
      <UserPagePinnedPosts {...{ user, replyPhoneNumber }} />
      <WelcomeBackToast />
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
    manifestUrl={({ currentFriend, user }) =>
      currentFriend
        ? routes.users.manifest.path({
            id: user.id,
            query: {
              friend_token: currentFriend.access_token,
            },
          })
        : null
    }
    withContainer
    containerSize="xs"
    withGutter
  >
    <IconsMeta />
    {page}
  </AppLayout>
);

export default UserPage;

const IconsMeta: FC = () => {
  const { faviconSrc, faviconImageSrc, appleTouchIconSrc } =
    usePageProps<UserPageProps>();
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

interface FeedProps {
  user: User;
  replyPhoneNumber: string | null;
}

const Feed: FC<FeedProps> = ({ user, replyPhoneNumber }) => {
  const currentFriend = useCurrentFriend();
  const { post_id } = useQueryParams();
  const { posts, hasMorePosts, setSize } = useUserPagePosts(user.id);
  const [loadingMore, setLoadingMore] = useState(false);
  return (
    <Stack>
      {posts ? (
        isEmpty(posts) ? (
          <Card withBorder>
            <Stack justify="center" gap={2} ta="center" mih={60}>
              <Title order={4} lh="xs">
                no posts yet!
              </Title>
            </Stack>
          </Card>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                {...{ post }}
                blurContent={!currentFriend && post.visibility !== "public"}
                focus={post_id === post.id}
                actions={
                  <FriendPostCardActions
                    {...{ user, post, replyPhoneNumber }}
                  />
                }
              />
            ))}
            {hasMorePosts && (
              <LoadMoreButton
                loading={loadingMore}
                style={{ alignSelf: "center" }}
                onVisible={() => {
                  setLoadingMore(true);
                  void setSize(size => size + 1).finally(() => {
                    setLoadingMore(false);
                  });
                }}
              />
            )}
          </>
        )
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [...new Array(3)].map((_, i) => <Skeleton key={i} h={120} />)
      )}
    </Stack>
  );
};

interface RefreshPostsButtonProps extends BoxProps {
  userId: string;
}

const RefreshPostsButton: FC<RefreshPostsButtonProps> = ({
  userId,
  ...otherProps
}) => {
  const {
    mutate: mutatePosts,
    isValidating,
    posts,
  } = useUserPagePosts(userId, {
    revalidateOnMount: false,
  });

  return (
    <ActionIcon
      variant="light"
      color="gray"
      size="lg"
      loading={isValidating}
      onClick={() => {
        const firstPost = first(posts);
        void mutate((key: string) => {
          if (typeof key === "string") {
            return key.startsWith("/posts");
          }
        });
        void mutatePosts().then(pages => {
          const latestFirstPage = first(pages);
          const latestFirstPost = first(latestFirstPage?.posts);
          if (
            firstPost &&
            latestFirstPost &&
            firstPost.id === latestFirstPost.id
          ) {
            toast.success("no new posts", {
              description: "you're all caught up :)",
            });
          }
        });
      }}
      {...otherProps}
    >
      <RefreshIcon />
    </ActionIcon>
  );
};

const WelcomeBackToast: FC = () => {
  const currentFriend = useCurrentFriend();
  const visibility = useDocumentVisibility();
  const lastWelcomedRef = useRef<DateTime | null>(null);
  useEffect(() => {
    if (!currentFriend && visibility === "hidden") {
      return;
    }
    if (
      lastWelcomedRef.current &&
      lastWelcomedRef.current.diffNow().hours < 1
    ) {
      return;
    }
    if (currentFriend && visibility === "visible") {
      lastWelcomedRef.current = DateTime.now();
      const friendName = [currentFriend.emoji, currentFriend.name]
        .filter(Boolean)
        .join(" ");
      const timeout = setTimeout(() => {
        toast.success(`welcome back, ${friendName}`, {
          duration: 2400,
        });
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [visibility]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};
