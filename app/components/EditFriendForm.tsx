import { type WorldFriend } from "~/types";

import EmojiPopover from "./EmojiPopover";

import classes from "./EditFriendForm.module.css";

export interface EditFriendFormProps extends BoxProps {
  friend: WorldFriend;
  onFriendUpdated?: (friend: WorldFriend) => void;
}

const EditFriendForm: FC<EditFriendFormProps> = ({
  friend,
  onFriendUpdated,
  ...otherProps
}) => {
  const initialValues = useMemo(
    () => ({ emoji: friend.emoji ?? "", name: friend.name }),
    [friend],
  );
  const {
    submit,
    values,
    submitting,
    getInputProps,
    setFieldValue,
    setInitialValues,
    reset,
  } = useForm({
    action: routes.worldFriends.update,
    params: {
      id: friend.id,
    },
    descriptor: "update friend",
    initialValues,
    transformValues: ({ emoji, ...values }) => ({
      friend: {
        ...values,
        emoji: emoji || null,
      },
    }),
    onSuccess: ({ friend }: { friend: WorldFriend }) => {
      void mutateRoute(routes.worldFriends.index);
      onFriendUpdated?.(friend);
    },
  });
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box component="form" onSubmit={submit} {...otherProps}>
      <Stack gap="xs">
        <Group gap="xs" align="start">
          <EmojiPopover
            onEmojiClick={({ emoji }) => {
              setFieldValue("emoji", emoji);
            }}
          >
            {({ open, opened }) => (
              <ActionIcon
                className={classes.emojiButton}
                variant="default"
                size={36}
                mod={{ opened }}
                onClick={() => {
                  if (values.emoji) {
                    setFieldValue("emoji", "");
                  } else {
                    open();
                  }
                }}
              >
                {values.emoji ? (
                  <Box className={classes.emoji}>{values.emoji}</Box>
                ) : (
                  <Box component={EmojiIcon} c="dimmed" />
                )}
              </ActionIcon>
            )}
          </EmojiPopover>
          <TextInput
            {...getInputProps("name")}
            placeholder={friend.name}
            style={{ flexGrow: 1 }}
          />
        </Group>
        <Button
          variant="filled"
          type="submit"
          loading={submitting}
          leftSection={<SaveIcon />}
          style={{ alignSelf: "center" }}
        >
          save
        </Button>
      </Stack>
    </Box>
  );
};

export default EditFriendForm;
