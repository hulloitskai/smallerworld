import { Input, InputBase, PinInput, Text } from "@mantine/core";
import { randomId } from "@mantine/hooks";
import { IMaskInput } from "react-imask";

import RetryIcon from "~icons/heroicons/arrow-path-20-solid";

import AppLayout from "~/components/AppLayout";
import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { mustParsePhoneFromParts, parsePhoneFromParts } from "~/helpers/phone";
import { type LoginRequest } from "~/types";

export interface LoginPageProps extends SharedPageProps {}

const LoginPage: PageComponent<LoginPageProps> = () => {
  const { url: pagePath } = usePage();
  const [showLoginCodeInput, setShowLoginCodeInput] = useState(false);

  // == Form
  const initialValues = {
    country_code: "+1",
    national_phone_number: "",
    login_code: "",
  };
  type FormValues = typeof initialValues;
  interface CreateLoginRequestFormSubmission {
    login_request: {
      phone_number: string;
    };
  }
  interface CreateSessionFormSubmission {
    login: {
      phone_number: string;
      login_code: string;
    };
  }
  type FormData = { loginRequest?: LoginRequest } | { registered: boolean };
  type TransformValues = (
    values: FormValues,
  ) => CreateLoginRequestFormSubmission | CreateSessionFormSubmission;
  const { values, getInputProps, submitting, setFieldValue, submit } = useForm<
    FormData,
    FormValues,
    TransformValues
  >({
    initialValues,
    validate: {
      national_phone_number: (value, values) => {
        const phoneNumber = parsePhoneFromParts(values);
        if (!phoneNumber) {
          return "Invalid phone number";
        }
      },
    },
    ...(showLoginCodeInput
      ? {
          action: routes.sessions.create,
          descriptor: "sign in",
          transformValues: ({ login_code, ...phonePartsValues }) => {
            const phoneNumber = mustParsePhoneFromParts(phonePartsValues);
            return {
              login: {
                phone_number: phoneNumber,
                login_code,
              },
            };
          },
        }
      : {
          action: routes.loginRequests.create,
          descriptor: "send login code",
          transformValues: values => {
            const phoneNumber = mustParsePhoneFromParts(values);
            return {
              login_request: { phone_number: phoneNumber },
            };
          },
        }),
    onSuccess: data => {
      if (showLoginCodeInput) {
        invariant(
          "registered" in data,
          "Missing registration status after sign in",
        );
        const { registered } = data;
        const query = queryParamsFromPath(pagePath);
        if (registered) {
          const worldPath = withTrailingSlash(
            routes.userWorld.show.path({ query }),
          );
          location.href = worldPath;
        } else {
          const registrationPath = routes.registrations.new.path({ query });
          router.visit(registrationPath);
        }
      } else {
        setShowLoginCodeInput(true);
        if ("loginRequest" in data && data.loginRequest) {
          const { loginRequest } = data;
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
      }
    },
  });

  const stepComplete = useMemo(() => {
    const { national_phone_number, country_code, login_code } = values;
    const phoneNumber = [country_code, national_phone_number]
      .filter(Boolean)
      .join(" ");
    if (showLoginCodeInput) {
      return !!phoneNumber && !!login_code;
    }
    return !!phoneNumber;
  }, [showLoginCodeInput, values]);

  return (
    <Card w="100%" maw={380} withBorder>
      <Card.Section inheritPadding withBorder pt="sm" pb={8}>
        <Title size="h4" ta="center" lh="xs">
          sign in or sign up
        </Title>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <form onSubmit={submit}>
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
              disabled={showLoginCodeInput}
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
                    disabled={showLoginCodeInput}
                    w={60}
                  />
                  {children}
                  <Transition mounted={showLoginCodeInput}>
                    {transitionStyle => (
                      <ActionIcon
                        onClick={() => {
                          setShowLoginCodeInput(false);
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
            <Transition transition="pop" mounted={showLoginCodeInput}>
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
                leftSection={
                  showLoginCodeInput ? <SignInIcon /> : <PhoneIcon />
                }
                disabled={!stepComplete}
                loading={submitting}
              >
                {showLoginCodeInput ? "sign in" : "send login code"}
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
        </form>
      </Card.Section>
    </Card>
  );
};

LoginPage.layout = page => (
  <AppLayout title="sign in">
    <Center style={{ flexGrow: 1 }}>{page}</Center>
  </AppLayout>
);

export default LoginPage;
