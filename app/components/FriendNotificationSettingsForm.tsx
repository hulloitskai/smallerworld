import { Chip, Input } from "@mantine/core";
import { pluralize } from "inflection";

import { type FormHelper } from "~/helpers/form";
import {
  type FriendNotificationSettingsFormSubmission,
  type FriendNotificationSettingsFormValues,
  useFriendNotificationSettingsForm,
} from "~/helpers/friends";
import {
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  POST_TYPES,
} from "~/helpers/posts";
import { type Friend, type FriendNotificationSettings } from "~/types";

import classes from "./FriendNotificationSettingsForm.module.css";

export interface FriendNotificationSettingsFormProps {
  currentFriend: Friend;
  notificationSettings: FriendNotificationSettings;
}

const FriendNotificationSettingsForm: FC<
  FriendNotificationSettingsFormProps
> = ({ currentFriend, notificationSettings }) => {
  const form = useFriendNotificationSettingsForm({
    currentFriend,
    notificationSettings,
    onSuccess: () => {
      toast.success("notification preferences updated");
    },
  });
  const { isDirty, submitting, submit } = form;
  return (
    <form onSubmit={submit}>
      <Stack gap="xs">
        <FriendNotificationSettingsFormInputs {...{ form }} />
        <Transition transition="fade" mounted={isDirty()}>
          {transitionStyle => (
            <Button
              type="submit"
              variant="filled"
              size="compact-sm"
              leftSection={<SaveIcon />}
              loading={submitting}
              disabled={!isDirty()}
              style={[{ alignSelf: "center" }, transitionStyle]}
            >
              save preferences
            </Button>
          )}
        </Transition>
      </Stack>
    </form>
  );
};

export default FriendNotificationSettingsForm;

export interface FriendNotificationSettingsFormInputsProps extends BoxProps {
  form: FormHelper<
    {},
    FriendNotificationSettingsFormValues,
    (
      values: FriendNotificationSettingsFormValues,
    ) => FriendNotificationSettingsFormSubmission
  >;
}

export const FriendNotificationSettingsFormInputs: FC<
  FriendNotificationSettingsFormInputsProps
> = ({ form, ...otherProps }) => {
  const { getInputProps } = form;
  return (
    <Input.Wrapper
      label="i want to be notified about:"
      styles={{
        root: {
          display: "flex",
          flexDirection: "column",
          rowGap: rem(6),
        },
        label: {
          fontFamily: "var(--mantine-font-family-headings)",
          textAlign: "center",
        },
      }}
      {...otherProps}
    >
      <Chip.Group multiple {...getInputProps("subscribed_post_types")}>
        <Group justify="center" gap={6} wrap="wrap" maw={340} mx="auto">
          {POST_TYPES.map(postType => (
            <Chip key={postType} value={postType} className={classes.chip}>
              <Box
                component={POST_TYPE_TO_ICON[postType]}
                fz="xs"
                mr={2}
                style={{
                  verticalAlign: "middle",
                  position: "relative",
                  bottom: rem(2),
                }}
              />{" "}
              {pluralize(POST_TYPE_TO_LABEL[postType])}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
    </Input.Wrapper>
  );
};
