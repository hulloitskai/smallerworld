import { Image, Popover, Text } from "@mantine/core";

import MailIcon from "~icons/heroicons/envelope-open-20-solid";

import logoSrc from "~/assets/images/logo.png";

import AppLayout from "~/components/AppLayout";
import FriendPostCardActions from "~/components/FriendPostCardActions";
import PostCard from "~/components/PostCard";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { type Friend, type User, type UserPost } from "~/types";

import classes from "./PostSharePage.module.css";
import userPageClasses from "./UserPage.module.css";

export interface PostSharePageProps extends SharedPageProps {
  user: User;
  post: UserPost;
  sharer: Friend;
}

const ICON_SIZE = 96;

const PostSharePage: PageComponent<PostSharePageProps> = ({
  user,
  post,
  sharer,
}) => {
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();

  // == User theme
  useUserTheme(user.theme);

  return (
    <Stack>
      <Box pos="relative">
        <Stack gap="sm">
          <Image
            className={userPageClasses.pageIcon}
            src={user.page_icon.src}
            srcSet={user.page_icon.srcset ?? undefined}
            w={ICON_SIZE}
            h={ICON_SIZE}
            radius={ICON_SIZE / USER_ICON_RADIUS_RATIO}
            {...(currentFriend && {
              onClick: () => {
                const pageUrl = normalizeUrl(
                  routes.users.show.path({
                    id: user.handle,
                    query: {
                      friend_token: currentFriend.access_token,
                    },
                  }),
                );
                void navigator.clipboard.writeText(pageUrl).then(() => {
                  toast.success("page url copied");
                });
              },
            })}
          />
          <Title className={userPageClasses.pageTitle} size="h2">
            {possessive(user.name)} world
          </Title>
        </Stack>
        {!currentUser && (
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
      <Alert className={classes.sharerAlert} icon={<MailIcon />}>
        <Text inherit span fw={600}>
          {sharer.name}
        </Text>{" "}
        shared{" "}
        <Text inherit span fw={600}>
          {possessive(user.name)}
        </Text>{" "}
        post with you.
      </Alert>
      <PostCard
        {...{ post }}
        actions={<FriendPostCardActions {...{ user, post }} />}
      />
    </Stack>
  );
};

PostSharePage.layout = page => (
  <AppLayout<PostSharePageProps>
    title={({ user }) => `${possessive(user.name)} world`}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default PostSharePage;
