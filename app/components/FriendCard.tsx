import { CopyButton, Popover, Text } from "@mantine/core";

import CopyIcon from "~icons/heroicons/clipboard-document-20-solid";
import CopiedIcon from "~icons/heroicons/clipboard-document-check-20-solid";
import PauseIcon from "~icons/heroicons/pause-20-solid";

import { type Friend } from "~/types";

import classes from "./FriendCard.module.css";

export interface FriendCardProps {
  friend: Friend;
}

const FriendCard: FC<FriendCardProps> = ({ friend }) => {
  const currentUser = useAuthenticatedUser();
  const [accessUrl, setAccessUrl] = useState<string>("");
  useEffect(() => {
    const accessPath = routes.users.show.path({
      handle: currentUser.handle,
      query: { friend_token: friend.access_token },
    });
    const accessUrl = new URL(accessPath, location.origin);
    setAccessUrl(accessUrl.toString());
  }, [currentUser.handle, friend.access_token]);

  return (
    <Card withBorder>
      <Group gap={6} className={classes.group}>
        <Box fz="xl">{friend.emoji}</Box>
        <Box style={{ flexGrow: 1 }}>
          <Text ff="heading" fw={600}>
            {friend.name}
          </Text>
        </Box>
        <Stack align="end" gap={2}>
          <CopyButton value={accessUrl}>
            {({ copied, copy }) => (
              <Button
                variant="subtle"
                size="compact-sm"
                leftSection={copied ? <CopiedIcon /> : <CopyIcon />}
                disabled={!accessUrl}
                onClick={copy}
              >
                {copied ? "link copied!" : "copy invite link"}
              </Button>
            )}
          </CopyButton>
          <Popover width={320}>
            <Popover.Target>
              <Button
                variant="subtle"
                size="compact-sm"
                leftSection={<PauseIcon />}
                color="gray"
              >
                pause
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              pausing a friend stops them from seeing your posts. this feature
              is coming soon!
            </Popover.Dropdown>
          </Popover>
        </Stack>
      </Group>
    </Card>
  );
};

export default FriendCard;
