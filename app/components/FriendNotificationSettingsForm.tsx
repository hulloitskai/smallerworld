import { type BoxProps } from "@mantine/core";
import { Input } from "@mantine/core";
import { pluralize } from "inflection";

import { type FormHelper } from "~/helpers/form";
import {
  type FriendNotificationSettingsFormSubmission,
  type FriendNotificationSettingsFormValues,
  useFriendNotificationSettingsForm,
} from "~/helpers/friendNotificationSettings";
import {
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  POST_TYPES,
} from "~/helpers/posts";
import { type Friend, type FriendNotificationSettings } from "~/types";

export interface FriendNotificationSettingsFormProps {
  friend: Friend;
  notificationSettings: FriendNotificationSettings;
}

const FriendNotificationSettingsForm: FC<
  FriendNotificationSettingsFormProps
> = ({ friend, notificationSettings }) => {
  const form = useFriendNotificationSettingsForm({
    friend,
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
          {style => (
            <Button
              type="submit"
              variant="filled"
              size="compact-sm"
              leftSection={<SaveIcon />}
              loading={submitting}
              disabled={!isDirty()}
              style={[style, { alignSelf: "center" }]}
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
        <Group justify="center" gap={4} wrap="wrap">
          {POST_TYPES.map(postType => (
            <Chip key={postType} value={postType}>
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
