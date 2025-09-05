import { Popover, Text } from "@mantine/core";

import { NEKO_SIZE } from "~/helpers/neko";
import { confetti, particlePositionFor } from "~/helpers/particles";
import { type Encouragement, type Friend, type UserProfile } from "~/types";

import FeedbackNeko from "./FeedbackNeko";

import classes from "./EncouragementCard.module.css";

export interface EncouragementCardProps
  extends BoxProps,
    Pick<EncouragementPopoverProps, "onEncouragementCreated"> {
  currentFriend: Friend;
  user: UserProfile;
  lastSentEncouragement: Encouragement | null;
  showNeko?: boolean;
}

interface EncouragementPreset {
  emoji: string;
  message: string;
}

const PRESETS: EncouragementPreset[] = [
  { emoji: "❤️", message: "thinking abt you!!" },
  { emoji: "💭", message: "what's been on your mind?" },
  { emoji: "✨", message: "what's been inspiring you lately?" },
  { emoji: "🍵", message: "tea, please!" },
  { emoji: "🧳", message: "how's your trip going?" },
];

const EncouragementCard: FC<EncouragementCardProps> = ({
  currentFriend,
  user,
  lastSentEncouragement,
  onEncouragementCreated,
  showNeko = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // == Launch confetti after encouragement
  const pendingNewEncouragementRef = useRef(false);
  const [pendingNewEncouragement, setPendingNewEncouragement] = useState(false);
  useDidUpdate(() => {
    pendingNewEncouragementRef.current = pendingNewEncouragement;
  }, [pendingNewEncouragement]);
  useDidUpdate(() => {
    if (!lastSentEncouragement || !pendingNewEncouragementRef.current) {
      return;
    }
    setPendingNewEncouragement(false);
    const card = cardRef.current;
    if (card) {
      void confetti({
        position: particlePositionFor(card),
        spread: 200,
        ticks: 60,
        gravity: 1,
        startVelocity: 18,
        count: 12,
        scalar: 2,
        shapes: ["emoji"],
        shapeOptions: {
          emoji: {
            value: lastSentEncouragement.emoji,
          },
        },
      });
    }
  }, [lastSentEncouragement]);

  return (
    <Card ref={cardRef} className={classes.card} withBorder>
      {lastSentEncouragement ? (
        <Stack gap={4} align="center" ta="center">
          <Text ff="heading">
            you sent {user.name} a {lastSentEncouragement.emoji}!
          </Text>
          <Text size="xs" c="dimmed">
            you can send another nudge in{" "}
            <DurationUntilCanSendAnotherEncouragement
              encouragement={lastSentEncouragement}
            />
          </Text>
        </Stack>
      ) : (
        <Stack gap={8} align="center">
          <Text ff="heading" size="sm" fw={500} ta="center">
            help encourage {user.name} to share!
          </Text>
          <Group gap="xs">
            {PRESETS.map(({ emoji, message }) => (
              <EncouragementPopover
                key={emoji}
                {...{ currentFriend, emoji, message }}
                onEncouragementCreated={() => {
                  setPendingNewEncouragement(true);
                  onEncouragementCreated();
                }}
              />
            ))}
          </Group>
          <Text size="xs" c="dimmed" ta="center">
            tap on an emoji to send a friendly nudge :)
          </Text>
        </Stack>
      )}
      {showNeko && (
        <FeedbackNeko
          pos="absolute"
          top={2 - NEKO_SIZE}
          right="var(--mantine-spacing-lg)"
        />
      )}
      <LoadingOverlay
        visible={pendingNewEncouragement}
        overlayProps={{ radius: "default", backgroundOpacity: 0 }}
      />
    </Card>
  );
};

export default EncouragementCard;

interface EncouragementPopoverProps extends EncouragementFormProps {}

const EncouragementPopover: FC<EncouragementPopoverProps> = ({
  currentFriend,
  emoji,
  message,
  onEncouragementCreated,
}) => {
  const [opened, setOpened] = useState(false);
  return (
    <Popover width={300} shadow="md" {...{ opened }} onChange={setOpened}>
      <Popover.Target>
        <ActionIcon
          className={classes.presetButton}
          size="lg"
          variant="outline"
          onClick={() => {
            setOpened(true);
          }}
        >
          {emoji}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown px="xs">
        <EncouragementForm
          {...{ currentFriend, emoji, message }}
          onEncouragementCreated={() => {
            setOpened(false);
            onEncouragementCreated();
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
};

interface EncouragementFormProps {
  currentFriend: Friend;
  emoji: string;
  message: string;
  onEncouragementCreated: () => void;
}

const MAX_MESSAGE_LENGTH = 240;

const EncouragementForm: FC<EncouragementFormProps> = ({
  currentFriend,
  emoji,
  message,
  onEncouragementCreated,
}) => {
  const { getInputProps, submit, submitting, values } = useForm({
    action: routes.encouragements.create,
    params: {
      query: { friend_token: currentFriend.access_token },
    },
    descriptor: "send encouragement",
    initialValues: { message },
    transformValues: values => ({
      encouragement: {
        ...values,
        emoji,
      },
    }),
    onSuccess: () => {
      onEncouragementCreated();
    },
  });

  return (
    <form onSubmit={submit}>
      <Stack gap={0}>
        <Stack gap={2}>
          <Textarea
            {...getInputProps("message")}
            autosize
            minRows={1}
            maxRows={240}
            maxLength={MAX_MESSAGE_LENGTH}
            radius={10}
            autoFocus
            onFocus={({ currentTarget }) => {
              currentTarget.selectionStart = currentTarget.value.length;
            }}
          />
          <Text size="xs" c="dimmed" style={{ alignSelf: "end" }}>
            {values.message.length} / {MAX_MESSAGE_LENGTH}
          </Text>
        </Stack>
        <Button
          type="submit"
          variant="filled"
          leftSection={<SendIcon />}
          rightSection={emoji}
          loading={submitting}
          disabled={!values.message}
          style={{ alignSelf: "center" }}
        >
          send
        </Button>
      </Stack>
    </form>
  );
};

interface DurationUntilCanSendAnotherEncouragementProps {
  encouragement: Encouragement;
}

const DurationUntilCanSendAnotherEncouragement: FC<
  DurationUntilCanSendAnotherEncouragementProps
> = ({ encouragement }) => {
  const remainingHours = useMemo(() => {
    const lastSentAt = DateTime.fromISO(encouragement.created_at);
    return 12 + Math.ceil(lastSentAt.diffNow("hours").hours);
  }, [encouragement.created_at]);
  return (
    <>
      {remainingHours} {inflect("hour", remainingHours)}
    </>
  );
};
