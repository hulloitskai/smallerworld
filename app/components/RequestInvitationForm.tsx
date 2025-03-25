import { InputBase } from "@mantine/core";
import parsePhone from "phone";
import { IMaskInput } from "react-imask";

import RequestInvitationIcon from "~icons/heroicons/hand-raised-20-solid";

import { type JoinRequest, type User } from "~/types";

export interface RequestInvitationFormProps extends BoxProps {
  user: User;
  onJoinRequestCreated?: (joinRequest: JoinRequest) => void;
}

const RequestInvitationForm: FC<RequestInvitationFormProps> = ({
  user,
  onJoinRequestCreated,
  ...otherProps
}) => {
  const { submit, getInputProps, setFieldValue, values, submitting, data } =
    useForm({
      action: routes.users.requestInvitation,
      params: { id: user.id },
      descriptor: "submit invitation request",
      initialValues: {
        name: "",
        country_code: "+1",
        phone_without_country_code: "",
      },
      transformValues: ({ name, country_code, phone_without_country_code }) => {
        const { phoneNumber } = parsePhone(
          [country_code, phone_without_country_code].join(" "),
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
          description: "we'll text you when you're invited :)",
        });
        onJoinRequestCreated?.(joinRequest);
      },
    });
  const filled = useFieldsFilled(
    values,
    "name",
    "country_code",
    "phone_without_country_code",
  );
  const { joinRequest } = data ?? {};

  return (
    <Stack gap="lg" {...otherProps}>
      <form onSubmit={submit}>
        <Stack>
          <Stack gap={8}>
            <TextInput label="your name" {...getInputProps("name")} />
            <InputBase
              {...getInputProps("phone_without_country_code")}
              component={IMaskInput}
              mask="(000) 000-0000"
              type="tel"
              label="your phone #"
              placeholder="(___) ___ ____"
              autoComplete="mobile tel-national"
              onAccept={value => {
                setFieldValue("phone_without_country_code", value);
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
