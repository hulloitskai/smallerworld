import { Popover, Text } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { groupBy } from "lodash-es";
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
import { type PostReaction, type User, type UserPost } from "~/types";

import EmojiPopover from "./EmojiPopover";

import classes from "./FriendPostCardActions.module.css";
import postCardClasses from "./PostCard.module.css";

export interface FriendPostCardActionsProps {
  user: User;
  post: UserPost;
  replyPhoneNumber: string | null;
}

const FriendPostCardActions: FC<FriendPostCardActionsProps> = ({
  user,
  post,
  replyPhoneNumber,
}) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const currentFriend = useCurrentFriend();
  const { ref, inViewport } = useInViewport();

  // == Load reactions
  const { data } = useRouteSWR<{ reactions: PostReaction[] }>(
    routes.postReactions.index,
    {
      params: inViewport ? { post_id: post.id } : null,
      descriptor: "load reactions",
      keepPreviousData: true,
      refreshInterval: 5000,
      isVisible: () => inViewport,
    },
  );
  const { reactions } = data ?? {};
  const reactionsByEmoji = useMemo(
    () => groupBy(reactions, "emoji"),
    [reactions],
  );

  // == Reply via msg
  const [messagingPlatformSelectorOpened, setMessagingPlatformSelectorOpened] =
    useState(false);
  const bindMessagingPlatformSelectorButtonLongPress = useLongPress(() =>
    setMessagingPlatformSelectorOpened(true),
  );
  const [preferredMessagingPlatform, setPreferredMessagingPlatform] =
    usePreferredMessagingPlatform(user.id);
  const replyUri = useMemo(() => {
    if (replyPhoneNumber && preferredMessagingPlatform) {
      let body = post.reply_snippet;
      if (preferredMessagingPlatform === "whatsapp") {
        body = formatReplySnippetForWhatsApp(body);
      }
      return messageUri(replyPhoneNumber, body, preferredMessagingPlatform);
    }
  }, [replyPhoneNumber, post.reply_snippet, preferredMessagingPlatform]);

  return (
    <Group {...{ ref }} align="start" gap={2}>
      <Group gap={2} wrap="wrap" style={{ flexGrow: 1 }}>
        {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
          <ReactionButton
            key={emoji}
            postId={post.id}
            {...{ emoji, reactions }}
          />
        ))}
      </Group>
      <NewReactionButton
        postId={post.id}
        hasExistingReactions={!isEmpty(reactions)}
      />
      <Text inline fz="lg" className={postCardClasses.divider}>
        /
      </Text>
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
            className={classes.replyButton}
            mod={{ replied: post.replied }}
            onClick={() => {
              if (!currentFriend) {
                toast.warning(
                  "you must be invited to this page to reply via sms",
                );
              } else if (replyUri) {
                markAsReplied(post.id, currentFriend.access_token);
              } else {
                setMessagingPlatformSelectorOpened(true);
              }
            }}
            {...bindMessagingPlatformSelectorButtonLongPress()}
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
                      !!replyPhoneNumber && {
                        href: replyUri,
                        onClick: () => {
                          setPreferredMessagingPlatform(platform);
                          markAsReplied(post.id, currentFriend.access_token);
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
    </Group>
  );
};

export default FriendPostCardActions;

interface NewReactionButtonProps {
  postId: string;
  hasExistingReactions: boolean;
}

const NewReactionButton: FC<NewReactionButtonProps> = ({
  postId,
  hasExistingReactions,
}) => {
  const currentFriend = useCurrentFriend();

  // == Add reaction
  const { trigger, mutating } = useRouteMutation<{ reaction: PostReaction }>(
    routes.postReactions.create,
    {
      descriptor: "react to post",
      params: currentFriend
        ? {
            post_id: postId,
            query: {
              friend_token: currentFriend.access_token,
            },
          }
        : null,
      onSuccess: () => {
        void mutateRoute(routes.postReactions.index, { post_id: postId });
      },
    },
  );

  return (
    <EmojiPopover
      pickerProps={{
        reactionsDefaultOpen: !hasExistingReactions,
        reactions: [
          "2764-fe0f",
          "1f97a",
          "1f60d",
          "1f62d",
          "1f604",
          "203c-fe0f",
        ],
      }}
      onEmojiClick={({ emoji }) => {
        if (!currentFriend) {
          toast.warning(
            "you must be invited to this page to react to this post",
          );
          return;
        }
        void trigger({ reaction: { emoji } });
      }}
    >
      {({ open, opened }) => (
        <Button
          className={classes.newReactionButton}
          variant="subtle"
          size="compact-xs"
          leftSection={<EmojiIcon />}
          loading={mutating}
          onClick={open}
          mod={{ opened }}
        >
          react
        </Button>
      )}
    </EmojiPopover>
  );
};

interface ReactionButtonProps {
  postId: string;
  emoji: string;
  reactions: PostReaction[];
}

const ReactionButton: FC<ReactionButtonProps> = ({
  postId,
  emoji,
  reactions,
}) => {
  const currentFriend = useCurrentFriend();
  const currentReaction = useMemo(
    () =>
      currentFriend?.id
        ? reactions.find(reaction => reaction.friend_id === currentFriend.id)
        : null,
    [reactions, currentFriend?.id],
  );
  const [mutating, setMutating] = useState(false);

  return (
    <Button
      variant={currentReaction ? "light" : "subtle"}
      leftSection={emoji}
      size="compact-xs"
      loading={mutating}
      className={classes.reactionButton}
      onClick={() => {
        if (!currentFriend) {
          toast.warning(
            "you must be invited to this page to react to this post",
          );
          return;
        }
        setMutating(true);
        const action = currentReaction
          ? fetchRoute(routes.postReactions.destroy, {
              params: {
                id: currentReaction.id,
                query: {
                  friend_token: currentFriend.access_token,
                },
              },
              descriptor: "remove reaction",
            })
          : fetchRoute(routes.postReactions.create, {
              params: {
                post_id: postId,
                query: {
                  friend_token: currentFriend.access_token,
                },
              },
              descriptor: "react to post",
              data: {
                reaction: {
                  emoji,
                },
              },
            });
        void action
          .then(() => {
            void mutateRoute(routes.postReactions.index, { post_id: postId });
          })
          .finally(() => {
            setMutating(false);
          });
      }}
    >
      {reactions.length}
    </Button>
  );
};

const formatReplySnippetForWhatsApp = (replySnippet: string) => {
  return replySnippet.replace(/\n> \n/g, "\n") + "\u2800";
};

const markAsReplied = (postId: string, friendAccessToken: string) => {
  void fetchRoute<{ authorId: string }>(routes.posts.markAsReplied, {
    params: {
      id: postId,
      query: {
        friend_token: friendAccessToken,
      },
    },
    descriptor: "mark post as replied",
    failSilently: true,
  }).then(({ authorId }) => mutateUserPagePosts(authorId, friendAccessToken));
};
