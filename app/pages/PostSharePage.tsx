import { Image, Popover, Text } from "@mantine/core";
import { truncate } from "lodash-es";

import MailIcon from "~icons/heroicons/envelope-open-20-solid";

import logoSrc from "~/assets/images/logo.png";

import AppLayout from "~/components/AppLayout";
import PostCard from "~/components/PostCard";
import PostSharePageRequestInvitationAlert from "~/components/PostSharePageRequestInvitationAlert";
import PublicPostCardActions from "~/components/PublicPostCardActions";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import {
  type FriendProfile,
  type WorldProfile,
  type WorldPublicPost,
} from "~/types";
import type WorldPost from "~/types/WorldPost";

import classes from "./PostSharePage.module.css";
import worldPageClasses from "./WorldPage.module.css";

export interface PostSharePageProps extends SharedPageProps {
  world: WorldProfile;
  post: WorldPublicPost;
  sharer: FriendProfile | null;
  invitationRequested: boolean;
}

const ICON_SIZE = 96;

const PostSharePage: PageComponent<PostSharePageProps> = ({
  world,
  post,
  sharer,
}) => {
  useWorldTheme(world.theme);

  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();

  return (
    <Stack>
      <Box pos="relative">
        <Stack gap="sm">
          <Image
            className={worldPageClasses.worldIcon}
            src={world.icon.src}
            {...(!!world.icon.srcset && { srcSet: world.icon.srcset })}
            w={ICON_SIZE}
            h={ICON_SIZE}
            radius={ICON_SIZE / WORLD_ICON_RADIUS_RATIO}
            {...(currentFriend && {
              onClick: () => {
                const worldPath = withTrailingSlash(
                  routes.worlds.show.path({
                    id: world.handle,
                    query: {
                      friend_token: currentFriend.access_token,
                    },
                  }),
                );
                const pageUrl = normalizeUrl(worldPath);
                void navigator.clipboard.writeText(pageUrl).then(() => {
                  toast.success("page url copied");
                });
              },
            })}
          />
          <Title size="h2" ta="center" lh="xs">
            {world.name}
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
      <Alert className={classes.sharerAlert} icon={<MailIcon />}>
        <Text inherit span fw={600}>
          {sharer?.name ?? world.owner_name}
        </Text>{" "}
        shared{" "}
        {sharer ? (
          <Text inherit span fw={600}>
            {world.name}
          </Text>
        ) : (
          "a"
        )}{" "}
        post with you.
      </Alert>
      <PostCard
        {...{ post }}
        expanded
        actions={<PublicPostCardActions {...{ post }} />}
      />
      <PostSharePageRequestInvitationAlert />
    </Stack>
  );
};

PostSharePage.layout = page => (
  <AppLayout<PostSharePageProps>
    title={({ post, world }) => [world.name, postTitleSnippet(post)]}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default PostSharePage;

const postTitleSnippet = (post: WorldPost) =>
  truncate(post.title ?? post.snippet, { length: 24 });
