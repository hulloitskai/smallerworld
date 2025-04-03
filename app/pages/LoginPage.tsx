import { Input, InputBase, PinInput, Text } from "@mantine/core";
import parsePhone from "phone";
import { IMaskInput } from "react-imask";

import AppLayout from "~/components/AppLayout";
import { type PhoneVerificationRequest } from "~/types";

export interface LoginPageProps extends SharedPageProps {}

const LoginPage: PageComponent<LoginPageProps> = () => {
  const [showVerificationCodeInput, setShowVerificationCodeInput] =
    useState(false);

  // == Form
  const initialValues = {
    phone_number_country_code: "+1",
    phone_number_without_country_code: "",
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
    | { redirectUrl: string };
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
      phone_number_without_country_code: (value, values) => {
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
        invariant("redirectUrl" in data, "Missing redirect URL after sign in");
        router.visit(data.redirectUrl);
      } else {
        if ("verificationRequest" in data && data.verificationRequest) {
          const { verification_code, verification_code_message } =
            data.verificationRequest;
          const toastId = uuid();
          toast.success(
            "simulating verification code delivery in development",
            {
              id: toastId,
              description: (
                <Stack align="start" gap={8}>
                  <Box>&quot;{verification_code_message}&quot;</Box>
                  <Button
                    size="compact-sm"
                    onClick={() => {
                      setFieldValue("verification_code", verification_code);
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
        setShowVerificationCodeInput(true);
      }
    },
  });

  const stepComplete = useMemo(() => {
    const {
      phone_number_without_country_code,
      phone_number_country_code,
      verification_code,
    } = values;
    const phoneNumber = [
      phone_number_country_code,
      phone_number_without_country_code,
    ]
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
              {...getInputProps("phone_number_without_country_code")}
              component={IMaskInput}
              mask="(000) 000-0000"
              type="tel"
              label="your phone #"
              placeholder="(___) ___ ____"
              autoComplete="mobile tel-national"
              onAccept={value => {
                setFieldValue("phone_number_without_country_code", value);
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
                    {...getInputProps("phone_number_country_code")}
                    component={IMaskInput}
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
              {style => (
                <Input.Wrapper
                  label="login code"
                  description="enter the code sent to your phone"
                  {...{ style }}
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

interface PhonePartsFormValues {
  phone_number_country_code: string;
  phone_number_without_country_code: string;
}

const parsePhoneFromParts = ({
  phone_number_country_code,
  phone_number_without_country_code,
}: PhonePartsFormValues): string | null => {
  const number = [
    phone_number_country_code,
    phone_number_without_country_code,
  ].join(" ");
  const phone = parsePhone(number);
  return phone.isValid ? phone.phoneNumber : null;
};

const mustParsePhoneFromParts = (
  phonePartsValues: PhonePartsFormValues,
): string => {
  const phoneNumber = parsePhoneFromParts(phonePartsValues);
  if (!phoneNumber) {
    throw new Error("Invalid phone number");
  }
  return phoneNumber;
};
