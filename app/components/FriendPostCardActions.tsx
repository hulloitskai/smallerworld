import { Popover, Text } from "@mantine/core";

import ReplyIcon from "~icons/heroicons/chat-bubble-oval-left-20-solid";

import { type Post } from "~/types";

import postCardClasses from "./PostCard.module.css";

interface FriendPostCardActionsProps {
  post: Post;
  replyPhoneNumber: string;
}

const FriendPostCardActions: FC<FriendPostCardActionsProps> = ({
  post,
  replyPhoneNumber,
}) => {
  const replyUri = useMemo(() => {
    const encodedBody = encodeURIComponent(post.reply_snippet);
    return `sms:${replyPhoneNumber}&body=${encodedBody}`;
  }, [replyPhoneNumber, post.reply_snippet]);
  return (
    <Group gap={2}>
      <Popover position="bottom-start" arrowOffset={16}>
        <Popover.Target>
          <Button
            variant="subtle"
            size="compact-xs"
            leftSection={<EmojiIcon />}
          >
            react
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Text size="sm" c="dimmed">
            When emoji reactions will one day live here :)
          </Text>
        </Popover.Dropdown>
      </Popover>
      <Text inline fz="lg" className={postCardClasses.divider}>
        /
      </Text>
      <Button
        component="a"
        href={replyUri}
        variant="subtle"
        size="compact-xs"
        leftSection={<ReplyIcon />}
      >
        reply via sms
      </Button>
    </Group>
  );
};

export default FriendPostCardActions;
