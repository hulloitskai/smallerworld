import { Input, InputBase, PinInput, Text } from "@mantine/core";
import { randomId } from "@mantine/hooks";
import { IMaskInput } from "react-imask";

import AppLayout from "~/components/AppLayout";
import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { mustParsePhoneFromParts, parsePhoneFromParts } from "~/helpers/phone";
import { type PhoneVerificationRequest } from "~/types";

export interface LoginPageProps extends SharedPageProps {}

const LoginPage: PageComponent<LoginPageProps> = () => {
  const { url: pageUrl } = usePage();
  const [showVerificationCodeInput, setShowVerificationCodeInput] =
    useState(false);

  // == Form
  const initialValues = {
    country_code: "+1",
    national_phone_number: "",
    verification_code: "",
  };
  type FormValues = typeof initialValues;
  interface CreatePhoneVerificationRequestFormSubmission {
    verification_request: {
      phone_number: string;
    };
  }
  interface CreateSessionFormSubmission {
    login: {
      phone_number: string;
      verification_code: string;
    };
  }
  type FormData =
    | { verificationRequest?: PhoneVerificationRequest }
    | { registered: boolean };
  type TransformValues = (
    values: FormValues,
  ) =>
    | CreatePhoneVerificationRequestFormSubmission
    | CreateSessionFormSubmission;
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
    ...(showVerificationCodeInput
      ? {
          action: routes.session.create,
          descriptor: "sign in",
          transformValues: ({ verification_code, ...phonePartsValues }) => {
            const phoneNumber = mustParsePhoneFromParts(phonePartsValues);
            return {
              login: {
                phone_number: phoneNumber,
                verification_code,
              },
            };
          },
        }
      : {
          action: routes.phoneVerificationRequests.create,
          descriptor: "send login code",
          transformValues: values => {
            const phoneNumber = mustParsePhoneFromParts(values);
            return {
              verification_request: { phone_number: phoneNumber },
            };
          },
        }),
    onSuccess: data => {
      if (showVerificationCodeInput) {
        invariant(
          "registered" in data,
          "Missing registration status after sign in",
        );
        const { registered } = data;
        const queryParams = queryParamsFromPath(pageUrl);
        if (registered) {
          location.href = routes.world.show.path({ query: queryParams });
        } else {
          const registrationPath = routes.registration.new.path({
            query: queryParams,
          });
          router.visit(registrationPath);
        }
      } else {
        setShowVerificationCodeInput(true);
        if ("verificationRequest" in data && data.verificationRequest) {
          const { verificationRequest } = data;
          const toastId = randomId();
          toast.success(
            "simulating verification code delivery in development",
            {
              id: toastId,
              description: (
                <Stack align="start" gap={8}>
                  <Box>
                    &quot;{verificationRequest.verification_code_message}&quot;
                  </Box>
                  <Button
                    size="compact-sm"
                    onClick={() => {
                      setFieldValue(
                        "verification_code",
                        verificationRequest.verification_code,
                      );
                      toast.dismiss(toastId);
                    }}
                  >
                    auto-fill code
                  </Button>
                </Stack>
              ),
            },
          );
        }
      }
    },
  });

  const stepComplete = useMemo(() => {
    const { national_phone_number, country_code, verification_code } = values;
    const phoneNumber = [country_code, national_phone_number]
      .filter(Boolean)
      .join(" ");
    if (showVerificationCodeInput) {
      return !!phoneNumber && !!verification_code;
    }
    return !!phoneNumber;
  }, [showVerificationCodeInput, values]);

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
            <Transition transition="pop" mounted={showVerificationCodeInput}>
              {transitionStyle => (
                <Input.Wrapper
                  label="login code"
                  description="enter the code sent to your phone"
                  style={transitionStyle}
                >
                  <PinInput
                    {...getInputProps("verification_code")}
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
                  showVerificationCodeInput ? <SignInIcon /> : <PhoneIcon />
                }
                disabled={!stepComplete}
                loading={submitting}
              >
                {showVerificationCodeInput ? "sign in" : "send login code"}
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
