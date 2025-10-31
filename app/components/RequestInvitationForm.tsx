import { InputBase } from "@mantine/core";
import parsePhone from "phone";
import { IMaskInput } from "react-imask";

import RequestInvitationIcon from "~icons/heroicons/hand-raised-20-solid";

import { parsePhoneIntoParts } from "~/helpers/phone";
import { type JoinRequest, type UserProfile } from "~/types";

export interface RequestInvitationFormProps extends BoxProps {
  user: UserProfile;
  onJoinRequestCreated?: (joinRequest: JoinRequest) => void;
}

const RequestInvitationForm: FC<RequestInvitationFormProps> = ({
  user,
  onJoinRequestCreated,
  ...otherProps
}) => {
  const currentUser = useCurrentUser();
  const initialValues = useMemo(() => {
    if (currentUser) {
      const { name, phone_number } = currentUser;
      const { country_code, national_phone_number } =
        parsePhoneIntoParts(phone_number);
      return {
        name,
        country_code,
        national_phone_number,
      };
    }
    return {
      name: "",
      country_code: "+1",
      national_phone_number: "",
    };
  }, [currentUser]);
  const {
    submit,
    getInputProps,
    setFieldValue,
    values,
    submitting,
    data,
    setInitialValues,
    reset,
  } = useForm({
    action: routes.users.requestInvitation,
    params: { id: user.id },
    descriptor: "submit invitation request",
    initialValues,
    transformValues: ({ name, country_code, national_phone_number }) => {
      const { phoneNumber } = parsePhone(
        [country_code, national_phone_number].join(" "),
      );
      return {
        join_request: {
          name,
          phone_number: phoneNumber,
        },
      };
    },
    onSuccess: ({ joinRequest }: { joinRequest: JoinRequest }) => {
      toast.success("invitation request sent!", {
        description: (
          <>you'll get a text from {user.name} when they're ready for you :)</>
        ),
      });
      onJoinRequestCreated?.(joinRequest);
    },
  });
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps
  const filled = useFieldsFilled(
    values,
    "name",
    "country_code",
    "national_phone_number",
  );
  const { joinRequest } = data ?? {};

  return (
    <Stack gap="lg" {...otherProps}>
      <form onSubmit={submit}>
        <Stack>
          <Stack gap={8}>
            <TextInput label="your name" {...getInputProps("name")} />
            <InputBase
              {...getInputProps("national_phone_number")}
              component={IMaskInput}
              mask="(000) 000-0000"
              type="tel"
              label="your phone #"
              placeholder="(___) ___ ____"
              autoComplete="mobile tel-national"
              onAccept={value => {
                setFieldValue("national_phone_number", value);
              }}
              required
              disabled={!!joinRequest}
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
                    mask="+0[00]"
                    placeholder="+1"
                    autoComplete="mobile tel-country-code"
                    variant="default"
                    required
                    disabled={!!joinRequest}
                    withAsterisk={false}
                    w={60}
                  />
                  {children}
                </Group>
              )}
            />
          </Stack>
          <Button
            type="submit"
            leftSection={<RequestInvitationIcon />}
            loading={submitting}
            disabled={!filled || !!joinRequest}
          >
            request invitation
          </Button>
        </Stack>
      </form>
      {joinRequest && (
        <Alert variant="light" title="invitation request sent!">
          stay tuned for a text from {user.name} with your unique invite link :)
        </Alert>
      )}
    </Stack>
  );
};

export default RequestInvitationForm;
