import { type ButtonProps, Popover, Text } from "@mantine/core";
import { useLongPress } from "use-long-press";

import ReplyIcon from "~icons/heroicons/chat-bubble-oval-left-20-solid";

import {
  messageUri,
  MESSAGING_PLATFORM_TO_ICON,
  MESSAGING_PLATFORM_TO_LABEL,
  MESSAGING_PLATFORMS,
  usePreferredMessagingPlatform,
} from "~/helpers/messaging";
import { mutateUserPagePosts } from "~/helpers/userPages";
import { type User, type UserPost } from "~/types";

import classes from "./PostCardReplyButton.module.css";

export interface PostCardReplyButtonProps extends ButtonProps {
  user: User;
  post: UserPost;
  replyToNumber: string | null;
}

const PostCardReplyButton: FC<PostCardReplyButtonProps> = ({
  user,
  post,
  replyToNumber,
  ...otherProps
}) => {
  const currentFriend = useCurrentFriend();
  const vaulPortalTarget = useVaulPortalTarget();

  // == Select platform
  const [messagingPlatformSelectorOpened, setMessagingPlatformSelectorOpened] =
    useState(false);
  const bindMessagingPlatformSelectorButtonLongPress = useLongPress(() =>
    setMessagingPlatformSelectorOpened(true),
  );
  const [preferredMessagingPlatform, setPreferredMessagingPlatform] =
    usePreferredMessagingPlatform(user.id);

  // == Reply URI
  const replyUri = useMemo(() => {
    if (replyToNumber && preferredMessagingPlatform) {
      let body = post.reply_snippet;
      if (preferredMessagingPlatform === "whatsapp") {
        body = formatReplySnippetForWhatsApp(body);
      }
      return messageUri(replyToNumber, body, preferredMessagingPlatform);
    }
  }, [replyToNumber, post.reply_snippet, preferredMessagingPlatform]);

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
      width={265}
      shadow="md"
      portalProps={{ target: vaulPortalTarget }}
      opened={messagingPlatformSelectorOpened}
      onChange={setMessagingPlatformSelectorOpened}
    >
      <Popover.Target>
        <Button
          component="a"
          {...(!messagingPlatformSelectorOpened && { href: replyUri })}
          target="_blank"
          rel="noopener noreferrer nofollow"
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
          className={classes.button}
          mod={{ replied: post.replied }}
          onClick={() => {
            if (!currentFriend) {
              toast.warning(
                <>
                  you must be invited to {possessive(user.name)} world to reply
                  via sms
                </>,
              );
            } else if (replyUri) {
              void markReplied();
            } else {
              setMessagingPlatformSelectorOpened(true);
            }
          }}
          {...bindMessagingPlatformSelectorButtonLongPress()}
          {...otherProps}
        >
          reply via {preferredMessagingPlatform ?? "sms"}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Text ta="center" ff="heading" fw={500}>
            reply using:
          </Text>
          <Group justify="center" gap="sm">
            {MESSAGING_PLATFORMS.map(platform => (
              <Stack key={platform} gap={2} align="center" miw={60}>
                <ActionIcon
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  variant="light"
                  size="lg"
                  {...(currentFriend &&
                    !!replyToNumber && {
                      href: replyUri,
                      onClick: () => {
                        setPreferredMessagingPlatform(platform);
                        setMessagingPlatformSelectorOpened(false);
                        void markReplied();
                      },
                    })}
                >
                  <Box component={MESSAGING_PLATFORM_TO_ICON[platform]} />
                </ActionIcon>
                <Text size="xs" fw={500} ff="heading" c="dimmed">
                  {MESSAGING_PLATFORM_TO_LABEL[platform]}
                </Text>
              </Stack>
            ))}
          </Group>
          <Text size="xs" className={classes.messagingPlatformSelectorHint}>
            <span style={{ fontWeight: 600 }}>
              smaller world will remember your choice.
            </span>
            <br />
            to open this menu again, hold the reply button.
          </Text>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

const formatReplySnippetForWhatsApp = (replySnippet: string) =>
  replySnippet.replace(/\n> \n/g, "\n") + "\u2800";

export default PostCardReplyButton;
