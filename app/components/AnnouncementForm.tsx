import parsePhone from "phone";

import { type Announcement } from "~/types";

export interface AnnouncementFormProps extends BoxProps {
  onAnnouncementCreated?: (announcement: Announcement) => void;
}

const AnnouncementForm: FC<AnnouncementFormProps> = ({
  onAnnouncementCreated,
  ...otherProps
}) => {
  const [testMode, setTestMode] = useState(false);
  const { submit, getInputProps, submitting } = useForm({
    action: routes.announcements.create,
    descriptor: "create announcement",
    initialValues: {
      test_recipient_phone_number: "",
      message: "",
    },
    transformValues: ({ test_recipient_phone_number, ...values }) => ({
      announcement: {
        ...values,
        test_recipient_phone_number: testMode
          ? formatPhoneNumber(test_recipient_phone_number)
          : null,
      },
    }),
    validate: {
      test_recipient_phone_number: (value: string) => {
        try {
          formatPhoneNumber(value);
          return null;
        } catch (error) {
          if (error instanceof Error) {
            return error.message;
          }
          return "Invalid phone number";
        }
      },
    },
    onSuccess: ({ announcement }: { announcement: Announcement }) => {
      void mutateRoute(routes.announcements.index);
      onAnnouncementCreated?.(announcement);
    },
  });

  return (
    <Box component="form" onSubmit={submit} {...otherProps}>
      <Stack gap="xs">
        <Textarea
          {...getInputProps("message")}
          label="announcement"
          placeholder="hi smaller world users, i have an important announcement to make..."
          autosize
          required
          minRows={4}
        />
        <Group gap="xs" align="start">
          <Checkbox
            label="send to a test recipient"
            checked={testMode}
            onChange={({ target }) => {
              setTestMode(target.checked);
            }}
            mt={8}
          />
          {testMode && (
            <TextInput
              {...getInputProps("test_recipient_phone_number")}
              placeholder="+1 (416) 825-1502"
              required
              style={{ flexGrow: 1 }}
            />
          )}
        </Group>
        <Button type="submit" leftSection={<SendIcon />} loading={submitting}>
          send it!!!
        </Button>
      </Stack>
    </Box>
  );
};

export default AnnouncementForm;

const formatPhoneNumber = (phoneNumber: string): string => {
  const result = parsePhone(phoneNumber);
  if (!result.phoneNumber) {
    throw new Error("Invalid phone number");
  }
  return result.phoneNumber;
};
