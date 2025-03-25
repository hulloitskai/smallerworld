import { ActionIcon, Popover, Text } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { groupBy } from "lodash-es";
import { useLongPress } from "use-long-press";

import ReplyIcon from "~icons/heroicons/chat-bubble-oval-left-20-solid";

import {
  MESSAGING_PLATFORM_TO_ICON,
  MESSAGING_PLATFORM_TO_LABEL,
  MESSAGING_PLATFORMS,
  usePreferredMessagingPlatform,
} from "~/helpers/messaging";
import { mutateUserPagePosts } from "~/helpers/userPages";
import { type PostReaction, type PostView, type User } from "~/types";

import EmojiPopover from "./EmojiPopover";

import classes from "./FriendPostCardActions.module.css";
import postCardClasses from "./PostCard.module.css";

export interface FriendPostCardActionsProps {
  user: User;
  post: PostView;
  replyPhoneNumber: string | null;
}

const FriendPostCardActions: FC<FriendPostCardActionsProps> = ({
  user,
  post,
  replyPhoneNumber,
}) => {
  const currentFriend = useCurrentFriend();
  const { ref, inViewport } = useInViewport();

  // == Load reactions
  const { data } = useRouteSWR<{ reactions: PostReaction[] }>(
    routes.postReactions.index,
    {
      params: inViewport ? { post_id: post.id } : null,
      descriptor: "load reactions",
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
      return createReplyUri(
        replyPhoneNumber,
        post.reply_snippet,
        preferredMessagingPlatform,
      );
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
        shadow="md"
        opened={messagingPlatformSelectorOpened}
        onChange={setMessagingPlatformSelectorOpened}
      >
        <Popover.Target>
          <Button
            component="a"
            {...(!messagingPlatformSelectorOpened && { href: replyUri })}
            rel="noopener noreferrer nofollow"
            target="_blank"
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
                        href: createReplyUri(
                          replyPhoneNumber,
                          post.reply_snippet,
                          platform,
                        ),
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
            <Text size="xs" ta="center" c="dimmed">
              smaller world will remember your choice
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
  const { trigger: addReaction } = useRouteMutation<{ reaction: PostReaction }>(
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
        void addReaction({ reaction: { emoji } });
      }}
    >
      {({ open, opened }) => (
        <Button
          className={classes.newReactionButton}
          variant="subtle"
          size="compact-xs"
          leftSection={<EmojiIcon />}
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

const createReplyUri = (
  phoneNumber: string,
  replySnippet: string,
  platform: "sms" | "telegram" | "whatsapp",
) => {
  const encodedBody = encodeURIComponent(replySnippet);
  switch (platform) {
    case "sms":
      return `sms:${phoneNumber}?body=${encodedBody}`;
    case "telegram":
      return `https://t.me/${phoneNumber}?text=${encodedBody}`;
    case "whatsapp":
      return `https://wa.me/${phoneNumber}?text=${encodedBody}`;
  }
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
