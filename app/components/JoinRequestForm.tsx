import { InputBase } from "@mantine/core";
import parsePhone from "phone";
import { IMaskInput } from "react-imask";

import RequestInvitationIcon from "~icons/heroicons/hand-raised-20-solid";

import { parsePhoneIntoParts } from "~/helpers/phone";
import { type JoinRequest, type User, type WorldProfile } from "~/types";

export interface JoinRequestFormProps extends BoxProps {
  world: WorldProfile;
  onJoinRequestCreated?: (joinRequest: JoinRequest) => void;
}

const JoinRequestForm: FC<JoinRequestFormProps> = ({
  world,
  onJoinRequestCreated,
  ...otherProps
}) => {
  const currentUser = useCurrentUser();
  const { submit, getInputProps, setFieldValue, values, submitting, data } =
    useForm({
      action: routes.worldJoinRequests.create,
      params: { world_id: world.id },
      descriptor: "submit invitation request",
      initialValues: currentUser
        ? initialValuesFromUser(currentUser)
        : {
            name: "",
            country_code: "+1",
            national_phone_number: "",
          },
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
            <>
              you'll get a text from {world.owner_name} when they're ready for
              you :)
            </>
          ),
        });
        onJoinRequestCreated?.(joinRequest);
      },
    });
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
          stay tuned for a text from {world.owner_name} with your unique invite
          link :)
        </Alert>
      )}
    </Stack>
  );
};

export default JoinRequestForm;

const initialValuesFromUser = (user: User) => {
  const { name, phone_number } = user;
  const { country_code, national_phone_number } =
    parsePhoneIntoParts(phone_number);
  return { name, country_code, national_phone_number };
};
