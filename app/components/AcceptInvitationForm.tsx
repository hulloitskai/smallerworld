import { Text } from "@mantine/core";
import { InputBase } from "@mantine/core";
import { IMaskInput } from "react-imask";

import {
  mustParsePhoneFromParts,
  parsePhoneFromParts,
  parsePhoneIntoParts,
} from "~/helpers/phone";
import { type Invitation, type User } from "~/types";

export interface AcceptInvitationFormProps extends BoxProps {
  user: User;
  invitation: Invitation;
  initialPhoneNumber: string | null;
  onInvitationAccepted: (friendAccessToken: string) => void;
}

const AcceptInvitationForm: FC<AcceptInvitationFormProps> = ({
  user,
  invitation,
  initialPhoneNumber,
  onInvitationAccepted,
  ...otherProps
}) => {
  const initialValues = useMemo(() => {
    if (initialPhoneNumber) {
      return parsePhoneIntoParts(initialPhoneNumber);
    }
    return {
      country_code: "+1",
      national_phone_number: "",
    };
  }, [initialPhoneNumber]);
  type FormValues = typeof initialValues;
  interface FormSubmission {
    friend: {
      phone_number: string;
    };
  }
  const { getInputProps, setFieldValue, submitting, submit } = useForm<
    { friendAccessToken: string },
    FormValues,
    (values: FormValues) => FormSubmission
  >({
    action: routes.invitations.accept,
    params: {
      id: invitation.id,
    },
    descriptor: "accept invitation",
    initialValues,
    transformValues: values => {
      const phoneNumber = mustParsePhoneFromParts(values);
      return {
        friend: {
          phone_number: phoneNumber,
        },
      };
    },
    transformErrors: ({ phone_number }) => ({
      national_phone_number: phone_number,
    }),
    validate: {
      national_phone_number: (value, values) => {
        const phoneNumber = parsePhoneFromParts(values);
        if (!phoneNumber) {
          return "Invalid phone number";
        }
      },
    },
    onSuccess: ({ friendAccessToken }) => {
      onInvitationAccepted(friendAccessToken);
    },
  });

  return (
    <Box component="form" onSubmit={submit} {...otherProps}>
      <Stack>
        <InputBase
          {...getInputProps("national_phone_number")}
          component={IMaskInput}
          mask="(000) 000-0000"
          type="tel"
          label="your phone #"
          name="national_phone_number"
          placeholder="(___) ___ ____"
          autoComplete="mobile tel-national"
          onAccept={value => {
            setFieldValue("national_phone_number", value);
          }}
          required
          withAsterisk={false}
          styles={{
            label: { marginBottom: rem(4) },
            wrapper: { flexGrow: 1 },
          }}
          inputContainer={children => (
            <Group gap={8} align="start">
              <InputBase
                {...getInputProps("country_code")}
                component={IMaskInput}
                name="country_code"
                mask="+0[00]"
                placeholder="+1"
                autoComplete="mobile tel-country-code"
                variant="default"
                required
                withAsterisk={false}
                w={60}
              />
              {children}
            </Group>
          )}
        />
        <Stack gap={6}>
          <Button
            type="submit"
            variant="filled"
            loading={submitting}
            leftSection={<PhoneIcon />}
          >
            join {possessive(user.name)} world
          </Button>
          <Text
            size="xs"
            c="dimmed"
            ta="center"
            maw={240}
            style={{ alignSelf: "center" }}
          >
            by continuing, you agree to receive sms messages from{" "}
            <span style={{ fontWeight: 600 }}>smaller world</span>
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AcceptInvitationForm;
