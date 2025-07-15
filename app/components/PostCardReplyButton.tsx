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

  // == Select platform
  const [platformSelectorOpened, setPlatformSelectorOpened] = useState(false);
  const platformSelectorLongPressHandlers = useLongPress(() =>
    setPlatformSelectorOpened(true),
  );
  const [preferredPlatform, setPreferredPlatform] =
    usePreferredMessagingPlatform(user.id);

  // == Reply URI
  const replyUri = useMemo(() => {
    if (replyToNumber && preferredPlatform) {
      let body = post.reply_snippet;
      if (preferredPlatform === "whatsapp") {
        body = formatReplySnippetForWhatsApp(body);
      }
      return messageUri(replyToNumber, body, preferredPlatform);
    }
  }, [replyToNumber, post.reply_snippet, preferredPlatform]);

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
      arrowOffset={16}
      width={270}
      shadow="sm"
      portalProps={{ target: vaulPortalTarget }}
      opened={platformSelectorOpened}
      onChange={setPlatformSelectorOpened}
    >
      <Popover.Target>
        <Button
          className={classes.button}
          component="a"
          {...(!platformSelectorOpened && { href: replyUri })}
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
              setPlatformSelectorOpened(true);
            }
          }}
          {...platformSelectorLongPressHandlers()}
          {...otherProps}
        >
          reply via {preferredPlatform ?? "sms"}
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
                        setPreferredPlatform(platform);
                        setPlatformSelectorOpened(false);
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
