import { Text } from "@mantine/core";
import { useInViewport, useViewportSize } from "@mantine/hooks";
import { groupBy } from "lodash-es";
import { motion } from "motion/react";
import { lazy } from "react";

import StickerIcon from "~icons/ri/emoji-sticker-fill";

import { confetti, puffOfSmoke } from "~/helpers/particles";
import { type PostReaction, type PostSticker } from "~/types";

import Drawer from "./Drawer";
import EmojiPopover from "./EmojiPopover";
import PostCardReplyButton, {
  type PostCardReplyButtonProps,
} from "./PostCardReplyButton";
import StickerPicker from "./StickerPicker";

import classes from "./FriendPostCardActions.module.css";
import postCardClasses from "./PostCard.module.css";

const StickerPad = lazy(() => import("./StickerPad"));

export interface FriendPostCardActionsProps
  extends Pick<PostCardReplyButtonProps, "user" | "post" | "replyToNumber"> {}

const FriendPostCardActions: FC<FriendPostCardActionsProps> = ({
  user,
  post,
  replyToNumber,
}) => {
  const currentFriend = useCurrentFriend();
  const { ref, inViewport } = useInViewport();

  // == Load reactions
  const { data: reactionsData } = useRouteSWR<{ reactions: PostReaction[] }>(
    routes.postReactions.index,
    {
      params: inViewport ? { post_id: post.id } : null,
      descriptor: "load reactions",
      keepPreviousData: true,
      refreshInterval: 5000,
      isVisible: () => inViewport,
    },
  );
  const { reactions } = reactionsData ?? {};
  const reactionsByEmoji = useMemo(
    () => groupBy(reactions, "emoji"),
    [reactions],
  );

  // == Stickers
  const stickerPadRef = useRef<HTMLDivElement>(null);
  const [showStickerPad, setShowStickerPad] = useState(false);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);
  const { data: stickersData, mutate: mutateStickers } = useRouteSWR<{
    stickers: PostSticker[];
  }>(routes.postStickers.index, {
    params:
      user.supported_features.includes("stickers") && inViewport
        ? { post_id: post.id }
        : null,
    descriptor: "load stickers",
    keepPreviousData: true,
    refreshInterval: 5000,
    isVisible: () => inViewport,
    onSuccess: ({ stickers }) => {
      if (!isEmpty(stickers)) {
        setShowStickerPad(true);
      }
    },
  });
  const { stickers = [] } = stickersData ?? {};

  return (
    <>
      <Box>
        <Box
          component={motion.div}
          key="sticker-pad-container"
          layout
          variants={{
            hidden: { opacity: 0, scale: 0 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ delay: 0.2 }}
          animate={showStickerPad ? "visible" : "hidden"}
          pb={8}
        >
          {showStickerPad && (
            <StickerPad
              ref={stickerPadRef}
              postId={post.id}
              {...{ stickers }}
              optimisticallyUpdateStickers={async update => {
                await mutateStickers(
                  prevData => ({
                    stickers: update(prevData?.stickers ?? []),
                  }),
                  { revalidate: false },
                );
              }}
            />
          )}
        </Box>
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
          {user.supported_features.includes("stickers") ? (
            <Button
              variant="subtle"
              size="compact-xs"
              leftSection={<StickerIcon />}
              style={{ flexShrink: 0 }}
              onClick={() => {
                if (!currentFriend) {
                  toast.warning(
                    <>
                      you must be invited to {possessive(user.name)} world to
                      add stickers
                    </>,
                  );
                  return;
                }
                setShowStickerDrawer(true);
              }}
            >
              add sticker
            </Button>
          ) : (
            <NewReactionButton
              postId={post.id}
              hasExistingReactions={!isEmpty(reactions)}
            />
          )}
          <Text inline fz="lg" className={postCardClasses.divider}>
            /
          </Text>
          <PostCardReplyButton {...{ user, post, replyToNumber }} />
        </Group>
      </Box>
      <Drawer
        title="add sticker"
        opened={showStickerDrawer}
        classNames={{ body: classes.stickerDrawerBody }}
        onClose={() => {
          setShowStickerDrawer(false);
        }}
      >
        <StickerPicker
          onSelect={() => {
            setShowStickerPad(true);
            setShowStickerDrawer(false);
            setTimeout(() => {
              stickerPadRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 100);
          }}
        />
      </Drawer>
    </>
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
  const viewportSize = useViewportSize();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // == Add reaction
  const { trigger: triggerAdd, mutating } = useRouteMutation<{
    reaction: PostReaction;
  }>(routes.postReactions.create, {
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
  });

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
        void triggerAdd({ reaction: { emoji } });

        const button = buttonRef.current;
        if (!button) {
          return;
        }
        void confetti({
          position: particlePosition(button, viewportSize),
          spread: 200,
          ticks: 60,
          gravity: 1,
          startVelocity: 24,
          particleCount: 8,
          scalar: 2,
          shapes: ["emoji"],
          shapeOptions: {
            emoji: {
              value: emoji,
            },
          },
        });
      }}
    >
      {({ open, opened }) => (
        <Button
          ref={buttonRef}
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
  const viewportSize = useViewportSize();

  return (
    <Button
      variant={currentReaction ? "light" : "subtle"}
      leftSection={emoji}
      size="compact-xs"
      loading={mutating}
      className={classes.reactionButton}
      onClick={({ currentTarget }) => {
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
        if (currentReaction) {
          void puffOfSmoke({
            position: particlePosition(currentTarget, viewportSize),
          });
        } else {
          void confetti({
            position: particlePosition(currentTarget, viewportSize),
            spread: 200,
            ticks: 60,
            gravity: 1,
            startVelocity: 24,
            particleCount: 8,
            scalar: 2,
            shapes: ["emoji"],
            shapeOptions: {
              emoji: {
                value: emoji,
              },
            },
          });
        }
      }}
    >
      {reactions.length}
    </Button>
  );
};

const particlePosition = (
  target: HTMLElement,
  viewportSize: { width: number; height: number },
) => {
  const { x, y, width, height } = target.getBoundingClientRect();
  return {
    x: ((x + width / 2) / viewportSize.width) * 100,
    y: ((y + height / 2) / viewportSize.height) * 100,
  };
};
