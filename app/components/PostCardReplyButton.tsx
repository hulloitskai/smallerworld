import { type ButtonProps, Popover, Text } from "@mantine/core";

import {
  messageUri,
  MESSAGING_PLATFORM_TO_ICON,
  MESSAGING_PLATFORM_TO_LABEL,
  MESSAGING_PLATFORMS,
} from "~/helpers/messaging";
import { mutateUserPagePosts } from "~/helpers/userPages";
import { type UserPost, type UserProfile } from "~/types";

import classes from "./PostCardReplyButton.module.css";

export interface PostCardReplyButtonProps extends ButtonProps {
  user: UserProfile;
  post: UserPost;
  replyToNumber?: string | null;
}

const PostCardReplyButton: FC<PostCardReplyButtonProps> = ({
  user,
  post,
  replyToNumber,
  ...otherProps
}) => {
  const currentFriend = useCurrentFriend();
  const vaulPortalTarget = useVaulPortalTarget();

  // == Mark as replied
  const { trigger: markReplied, mutating: markingReplied } = useRouteMutation<{
    authorId: string;
  }>(routes.posts.markReplied, {
    params: {
      id: post.id,
      query: {
        ...(currentFriend && {
          friend_token: currentFriend.access_token,
        }),
      },
    },
    descriptor: "mark post as replied",
    failSilently: true,
    ...(currentFriend && {
      onSuccess: ({ authorId }) => {
        mutateUserPagePosts(authorId, currentFriend.access_token);
      },
    }),
  });

  return (
    <Popover
      position="bottom-end"
      arrowOffset={20}
      shadow="sm"
      portalProps={{ target: vaulPortalTarget }}
      disabled={!currentFriend || !replyToNumber}
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
          onClick={() => {
            if (!currentFriend || !replyToNumber) {
              toast.warning(
                <>
                  you must be invited to {possessive(user.name)} world to reply
                  via sms
                </>,
              );
            }
          }}
          {...otherProps}
        >
          reply by dm
        </Button>
      </Popover.Target>
      {currentFriend && !!replyToNumber && (
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
                    href={messageUri(
                      replyToNumber,
                      platform === "whatsapp"
                        ? formatReplySnippetForWhatsApp(post.reply_snippet)
                        : post.reply_snippet,
                      platform,
                    )}
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
      )}
    </Popover>
  );
};

const formatReplySnippetForWhatsApp = (replySnippet: string) =>
  replySnippet.replace(/\n> \n/g, "\n") + "\u2800";

export default PostCardReplyButton;
