import { Input, InputBase, PinInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IMaskInput } from "react-imask";

import RetryIcon from "~icons/heroicons/arrow-path-20-solid";

import { mustParsePhoneFromParts, parsePhoneFromParts } from "~/helpers/phone";
import { type LoginRequest } from "~/types";

export interface LoginFormProps extends BoxProps {
  onSessionCreated: (registered: boolean) => void;
}

const LoginForm: FC<LoginFormProps> = ({
  onSessionCreated,
  className,
  ...otherProps
}) => {
  const [loginCodeRequested, setLoginCodeRequested] = useState(false);

  const initialValues = {
    country_code: "+1",
    national_phone_number: "",
    login_code: "",
  };
  const {
    onSubmit,
    getInputProps,
    setFieldValue,
    values,
    submitting,
    setSubmitting,
  } = useForm({
    initialValues,
    validate: {
      national_phone_number: (value: string, values: typeof initialValues) => {
        const phoneNumber = parsePhoneFromParts(values);
        if (!phoneNumber) {
          return "invalid phone number";
        }
      },
    },
  });
  const requiredFieldsFilled = useMemo(() => {
    const { national_phone_number, country_code, login_code } = values;
    const phoneNumber = [country_code, national_phone_number]
      .filter(Boolean)
      .join(" ");
    if (loginCodeRequested) {
      return !!phoneNumber && !!login_code;
    }
    return !!phoneNumber;
  }, [loginCodeRequested, values]);

  return (
    <Box
      component="form"
      onSubmit={onSubmit(({ login_code, ...otherValues }, event) => {
        event?.stopPropagation();
        const phoneNumber = mustParsePhoneFromParts(otherValues);
        setSubmitting(true);
        let submission: Promise<any>;
        if (loginCodeRequested) {
          submission = fetchRoute<{ registered: boolean }>(
            routes.sessions.create,
            {
              descriptor: "sign in",
              data: {
                login: {
                  phone_number: phoneNumber,
                  login_code,
                },
              },
            },
          ).then(({ registered }) => {
            onSessionCreated(registered);
          });
        } else {
          submission = fetchRoute<{ loginRequest?: LoginRequest }>(
            routes.loginRequests.create,
            {
              descriptor: "send login code",
              data: {
                login_request: {
                  phone_number: phoneNumber,
                },
              },
            },
          ).then(({ loginRequest }) => {
            setLoginCodeRequested(true);
            if (loginRequest) {
              const toastId = randomId();
              toast.success("simulating login code delivery in development", {
                id: toastId,
                description: (
                  <Stack align="start" gap={8}>
                    <Box>&quot;{loginRequest.login_code_message}&quot;</Box>
                    <Button
                      size="compact-sm"
                      onClick={() => {
                        setFieldValue("login_code", loginRequest.login_code);
                        toast.dismiss(toastId);
                      }}
                    >
                      auto-fill code
                    </Button>
                  </Stack>
                ),
              });
            }
          });
        }
        void submission.finally(() => {
          setSubmitting(false);
        });
      })}
      className={cn("LoginForm", className)}
      {...otherProps}
    >
      <Stack gap="sm">
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
          disabled={loginCodeRequested}
          styles={{
            label: { marginBottom: rem(4) },
            wrapper: { flexGrow: 1 },
          }}
          inputContainer={children => (
            <Group gap={8} align="center">
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
                disabled={loginCodeRequested}
                w={60}
              />
              {children}
              <Transition mounted={loginCodeRequested}>
                {transitionStyle => (
                  <ActionIcon
                    onClick={() => {
                      setLoginCodeRequested(false);
                    }}
                    style={transitionStyle}
                  >
                    <RetryIcon />
                  </ActionIcon>
                )}
              </Transition>
            </Group>
          )}
        />
        <Transition transition="pop" mounted={loginCodeRequested}>
          {transitionStyle => (
            <Input.Wrapper
              label="login code"
              description="enter the code sent to your phone"
              style={transitionStyle}
            >
              <PinInput
                {...getInputProps("login_code")}
                type="number"
                length={6}
                autoFocus
                hiddenInputProps={{ autoComplete: "one-time-code" }}
              />
            </Input.Wrapper>
          )}
        </Transition>
        <Stack gap={6}>
          <Button
            type="submit"
            leftSection={loginCodeRequested ? <SignInIcon /> : <PhoneIcon />}
            disabled={!requiredFieldsFilled}
            loading={submitting}
          >
            {loginCodeRequested ? "sign in" : "send login code"}
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

export default LoginForm;
