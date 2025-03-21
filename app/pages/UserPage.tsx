import { ActionIcon, type BoxProps, Image, Overlay } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { mutate } from "swr";

import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

import AppLayout from "~/components/AppLayout";
import FriendNotificationsButton from "~/components/FriendNotificationsButton";
import FriendPostCardActions from "~/components/FriendPostCardActions";
import PostCard from "~/components/PostCard";
import UserPageInstallAlert from "~/components/UserPageInstallAlert";
import { openUserPageInstallationInstructionsModal } from "~/components/UserPageInstallationInstructionsModal";
import { UserPageRequestInvitationAlert } from "~/components/UserPageRequestInvitationAlert";
import { openUserPageWelcomeModal } from "~/components/UserPageWelcomeModal";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { useIsStandalone } from "~/helpers/pwa";
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
  intent: "join" | "installation_instructions" | null;
}

const ICON_SIZE = 96;

const UserPage: PageComponent<UserPageProps> = ({
  user,
  replyPhoneNumber,
  intent,
}) => {
  const isStandalone = useIsStandalone();
  const currentFriend = useCurrentFriend();
  const { registration } = useWebPush();
  const { modals } = useModals();
  useEffect(() => {
    if (!isEmpty(modals)) {
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
                <FriendNotificationsButton />
                {registration && <RefreshPostsButton userId={user.id} />}
              </Group>
            )}
          </Stack>
        </Stack>
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
        <UserPageRequestInvitationAlert userId={user.id} />
      )}
    </>
  );
};

UserPage.layout = page => (
  <AppLayout<UserPageProps>
    title={({ user, currentFriend, intent }) =>
      currentFriend && intent === "join"
        ? `you're invited to ${user.name}'s world`
        : `${user.name}'s world`
    }
    icons={({ faviconSrc, faviconImageSrc, appleTouchIconSrc }) => ({
      faviconSrc,
      faviconImageSrc,
      appleTouchIconSrc,
    })}
    manifestUrl={({ user, currentFriend }) =>
      currentFriend
        ? routes.users.manifest.path({
            id: user.id,
            query: {
              friend_token: currentFriend.access_token,
            },
          })
        : undefined
    }
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default UserPage;

interface FeedProps {
  user: User;
  replyPhoneNumber: string | null;
}

const Feed: FC<FeedProps> = ({ user, replyPhoneNumber }) => {
  const currentFriend = useCurrentFriend();
  const { posts } = useUserPagePosts(user.id);
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
          posts.map(post => (
            <PostCard
              key={post.id}
              {...{ post }}
              blurContent={!currentFriend && post.visibility !== "public"}
              actions={
                <FriendPostCardActions {...{ post, replyPhoneNumber }} />
              }
            />
          ))
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
