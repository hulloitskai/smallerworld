import { type ButtonProps, Popover, Text } from "@mantine/core";

import {
  messageUri,
  MESSAGING_PLATFORM_TO_ICON,
  MESSAGING_PLATFORM_TO_LABEL,
  MESSAGING_PLATFORMS,
} from "~/helpers/messaging";
import { mutateWorldPosts } from "~/helpers/worlds";
import {
  type UniversePost,
  type UniversePostAssociatedFriend,
  type WorldPost,
} from "~/types";

import classes from "./PostCardReplyButton.module.css";

export interface PostCardReplyButtonProps extends ButtonProps {
  post: WorldPost | UniversePost;
  replyToNumber: string;
  asFriend?: UniversePostAssociatedFriend;
}

const PostCardReplyButton: FC<PostCardReplyButtonProps> = ({
  post,
  replyToNumber,
  asFriend,
  ...otherProps
}) => {
  const currentFriend = useCurrentFriend();
  const friend = asFriend ?? currentFriend;
  const vaulPortalTarget = useVaulPortalTarget();

  // == Mark as replied
  const { trigger: markReplied, mutating: markingReplied } = useRouteMutation<{
    worldId: string | null;
  }>(routes.posts.markReplied, {
    params: {
      id: post.id,
      query: {
        ...(friend && {
          friend_token: friend.access_token,
        }),
      },
    },
    descriptor: "mark post as replied",
    failSilently: true,
    onSuccess: ({ worldId }) => {
      if (worldId) {
        void mutateWorldPosts(worldId);
      }
    },
  });

  return (
    <Popover
      position="bottom-end"
      arrowOffset={20}
      shadow="sm"
      portalProps={{ target: vaulPortalTarget }}
    >
      <Popover.Target>
        <Button
          className={classes.button}
          variant="subtle"
          size="compact-xs"
          loading={markingReplied}
          leftSection={
            <Box pos="relative">
              <ReplyIcon />
              {post.repliers > 0 && post.repliers < 40 && (
                <Center
                  fz={post.repliers > 20 ? 7 : post.repliers > 10 ? 8 : 9}
                  className={classes.repliersCount}
                >
                  {post.repliers}
                </Center>
              )}
            </Box>
          }
          mod={{ replied: post.replied }}
          {...otherProps}
        >
          reply by dm
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Text ta="center" ff="heading" fw={500} size="sm">
            reply using:
          </Text>
          <Group justify="center" gap="sm">
            {MESSAGING_PLATFORMS.map(platform => (
              <Stack key={platform} gap={2} align="center" miw={60}>
                <ActionIcon
                  component="a"
                  variant="light"
                  size="lg"
                  href={messageUri(replyToNumber, post.reply_snippet, platform)}
                  onClick={() => {
                    void markReplied();
                  }}
                >
                  <Box component={MESSAGING_PLATFORM_TO_ICON[platform]} />
                </ActionIcon>
                <Text size="xs" fw={500} ff="heading" c="dimmed">
                  {MESSAGING_PLATFORM_TO_LABEL[platform]}
                </Text>
              </Stack>
            ))}
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default PostCardReplyButton;
