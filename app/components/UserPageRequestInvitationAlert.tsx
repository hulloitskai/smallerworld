import { Affix, InputBase, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";
import parsePhone from "phone";
import { IMaskInput } from "react-imask";

import RequestInvitationIcon from "~icons/heroicons/hand-raised-20-solid";

import { type JoinRequest, type User } from "~/types";

import classes from "./UserPageRequestInvitationAlert.module.css";

export interface UserPageRequestInvitationAlertProps {
  user: User;
}

const ALERT_INSET = "var(--mantine-spacing-md)";

export const UserPageRequestInvitationAlert: FC<
  UserPageRequestInvitationAlertProps
> = ({ user }) => {
  const [opened, setOpened] = useState(true);
  const { modals } = useModals();
  return (
    <Affix
      position={{
        left: ALERT_INSET,
        right: ALERT_INSET,
        bottom: `calc(${ALERT_INSET} + var(--safe-area-inset-bottom, 0px))`,
      }}
    >
      <Transition transition="pop" mounted={isEmpty(modals) && opened}>
        {style => (
          <Alert
            variant="filled"
            icon={<NotificationIcon />}
            title="stay in the loop!"
            className={classes.alert}
            withCloseButton
            onClose={() => {
              setOpened(false);
            }}
            {...{ style }}
          >
            <Stack gap={8} align="start">
              <Text inherit>
                get notified about life updates, personal invitations, poems,
                and more!
              </Text>
              <Button
                variant="white"
                size="compact-sm"
                leftSection={<RequestInvitationIcon />}
                className={classes.button}
                onClick={() => {
                  openModal({
                    title: "request invitation",
                    className: classes.modal,
                    children: (
                      <RequestInvitationForm
                        {...{ user }}
                        onJoinRequestCreated={() => {
                          setOpened(false);
                        }}
                      />
                    ),
                  });
                }}
              >
                request invitation
              </Button>
            </Stack>
          </Alert>
        )}
      </Transition>
    </Affix>
  );
};

interface RequestInvitationFormProps {
  user: User;
  onJoinRequestCreated?: (joinRequest: JoinRequest) => void;
}

const RequestInvitationForm: FC<RequestInvitationFormProps> = ({
  user,
  onJoinRequestCreated,
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
    <Stack gap="lg">
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
                    w={54}
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
