import { Popover, Text } from "@mantine/core";

import { type Encouragement, type Friend, type User } from "~/types";

import classes from "./EncouragementCard.module.css";

export interface EncouragementCardProps
  extends BoxProps,
    Pick<EncouragementPopoverProps, "onEncouragementCreated"> {
  currentFriend: Friend;
  user: User;
  lastSentEncouragement: Encouragement | null;
}

interface EncouragementPreset {
  emoji: string;
  message: string;
}

const PRESETS: EncouragementPreset[] = [
  { emoji: "❤️", message: "what's on your heart today?" },
  { emoji: "✨", message: "what's been inspiring you lately?" },
  { emoji: "🍵", message: "i know u have tea to spill" },
];

const EncouragementCard: FC<EncouragementCardProps> = ({
  currentFriend,
  user,
  lastSentEncouragement,
  onEncouragementCreated,
}) => (
  <Card className={classes.card} withBorder>
    {lastSentEncouragement ? (
      <Stack gap={2} align="center" ta="center">
        <Text ff="heading">
          you sent {user.name} a {lastSentEncouragement.emoji}!
        </Text>
        <Text size="xs" c="dimmed">
          you can send another nudge in{" "}
          <DurationUntilCanSendAnotherEncouragement
            {...{ encouragement: lastSentEncouragement }}
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
              {...{ currentFriend, emoji, message, onEncouragementCreated }}
            />
          ))}
        </Group>
        <Text size="xs" c="dimmed" ta="center">
          tap on an emoji to send a friendly nudge :)
        </Text>
      </Stack>
    )}
  </Card>
);

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
    <Popover width={300} {...{ opened }} onChange={setOpened}>
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
            style={{ flexGrow: 1 }}
          />
          <Text size="xs" c="dimmed" style={{ alignSelf: "end" }}>
            {values.message.length} / {MAX_MESSAGE_LENGTH}
          </Text>
        </Stack>
        <Button
          type="submit"
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
      {remainingHours} {inflect("hours", remainingHours)}
    </>
  );
};
