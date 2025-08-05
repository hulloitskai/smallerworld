import { InputWrapper, Text } from "@mantine/core";

import { type Activity, type ActivityTemplate } from "~/types";

import EmojiPopover from "./EmojiPopover";

import classes from "./CreateActivityForm.module.css";

interface CreateActivityFormProps extends BoxProps {
  template: ActivityTemplate;
  onCreated: (activity: Activity) => void;
}

const CreateActivityForm: FC<CreateActivityFormProps> = ({
  template,
  onCreated,
  ...otherProps
}) => {
  // == Form
  const initialValues = {
    name: template.name,
    emoji: template.emoji,
    description: template.description,
    location_name: "",
  };
  const { values, getInputProps, setFieldValue, submit, submitting } = useForm<
    { activity: Activity },
    typeof initialValues
  >({
    action: routes.activities.create,
    descriptor: "set up activity",
    initialValues,
    transformValues: values => ({
      template_id: template.id,
      ...values,
    }),
    onSuccess: ({ activity }) => {
      onCreated(activity);
    },
  });
  const filled = useFieldsFilled(values, "name", "description");

  return (
    <Box {...otherProps}>
      <Stack>
        <Stack gap="xs">
          <InputWrapper label="name & emoji">
            <Group gap="xs" align="start" mt={4}>
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
                    onClick={() => {
                      if (values.emoji) {
                        setFieldValue("emoji", "");
                      } else {
                        open();
                      }
                    }}
                    mod={{ opened }}
                  >
                    {values.emoji ? (
                      <Box fz="xl">{values.emoji}</Box>
                    ) : (
                      <Box component={EmojiIcon} c="dimmed" />
                    )}
                  </ActionIcon>
                )}
              </EmojiPopover>
              <TextInput
                {...getInputProps("name")}
                required
                placeholder="cafe hang"
                style={{ flexGrow: 1 }}
              />
            </Group>
          </InputWrapper>
          <Textarea
            {...getInputProps("description")}
            label="description"
            required
            placeholder="we'll explore a new cafe that neither of us have been to yet, and make art together."
            autosize
            minRows={2}
            maxRows={4}
          />
          <Box>
            <TextInput
              {...getInputProps("location_name")}
              label="where (optional)"
              placeholder="Café Diplomatico"
            />
            <Text size="xs" c="dimmed">
              (google maps integration coming later...)
            </Text>
          </Box>
        </Stack>
        <Button
          leftSection={<SaveIcon />}
          variant="filled"
          disabled={!filled}
          loading={submitting}
          style={{ alignSelf: "center" }}
          onClick={() => {
            submit();
          }}
        >
          complete setup and add coupon
        </Button>
      </Stack>
    </Box>
  );
};

export default CreateActivityForm;
