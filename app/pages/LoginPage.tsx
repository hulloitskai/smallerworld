import { InputBase, InputWrapper, PinInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import parsePhone from "phone";
import { IMaskInput } from "react-imask";

import AppLayout from "~/components/AppLayout";
import { createSupabaseClient } from "~/helpers/supabase";

export interface LoginPageProps extends SharedPageProps {}

const LoginPage: PageComponent<LoginPageProps> = () => {
  // == Form
  const [showCodeInput, setShowCodeInput] = useState(false);
  const { values, getInputProps, onSubmit, submitting, setSubmitting } =
    useForm({
      initialValues: {
        countryCode: "+1",
        phoneWithoutCountryCode: "",
        code: "",
      },
    });
  const stepComplete = useMemo(() => {
    const { phoneWithoutCountryCode, countryCode, code } = values;
    if (showCodeInput) {
      return !!code && !!phoneWithoutCountryCode && !!countryCode;
    }
    return !!phoneWithoutCountryCode && !!countryCode;
  }, [showCodeInput, values]);

  return (
    <Card w="100%" maw={380} withBorder>
      <Card.Section inheritPadding withBorder pt="sm" pb={8}>
        <Title size="h4" ta="center" lh="xs">
          sign in or sign up
        </Title>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <form
          onSubmit={onSubmit(
            ({ phoneWithoutCountryCode, countryCode, code }) => {
              const supabase = createSupabaseClient();
              const { phoneNumber } = parsePhone(
                [countryCode, phoneWithoutCountryCode].join(" "),
              );
              invariant(phoneNumber, "Invalid phone number");
              setSubmitting(true);
              if (code) {
                void supabase.auth
                  .verifyOtp({
                    type: "sms",
                    phone: phoneNumber,
                    token: code,
                  })
                  .then(({ error }) => {
                    if (error) {
                      console.error("Failed to complete sign-in", error);
                      toast.error("Failed to complete sign-in", {
                        description: error.message,
                      });
                    } else {
                      router.visit(routes.home.show.path());
                    }
                  })
                  .catch((error: Error) => {
                    console.error("Unexpected error during sign-in", error);
                    toast.error("Unexpected error during sign-in");
                  })
                  .finally(() => {
                    setSubmitting(false);
                  });
              } else {
                void supabase.auth
                  .signInWithOtp({
                    phone: phoneNumber,
                    options: { channel: "sms", shouldCreateUser: true },
                  })
                  .then(({ error, data }) => {
                    if (error) {
                      console.error("Failed to initiate sign-in", error);
                    } else {
                      setShowCodeInput(true);
                      if (data.messageId === "test-otp") {
                        toast.warning("This is a testing number", {
                          description:
                            "Please use your test login code to continue.",
                        });
                      }
                    }
                  })
                  .finally(() => {
                    setSubmitting(false);
                  });
              }
            },
          )}
        >
          <Stack gap="sm">
            <InputBase
              {...getInputProps("phoneWithoutCountryCode")}
              component={IMaskInput}
              mask="(000) 000-0000"
              type="tel"
              label="your phone #"
              placeholder="(___) ___ ____"
              autoComplete="mobile tel-national"
              required
              withAsterisk={false}
              styles={{
                label: { marginBottom: rem(4) },
                wrapper: { flexGrow: 1 },
              }}
              inputContainer={children => (
                <Group gap={8} align="start">
                  <InputBase
                    {...getInputProps("countryCode")}
                    component={IMaskInput}
                    mask="+0[00]"
                    placeholder="+1"
                    autoComplete="mobile tel-country-code"
                    variant="default"
                    required
                    withAsterisk={false}
                    w={54}
                  />
                  {children}
                </Group>
              )}
            />
            <Transition transition="pop" mounted={showCodeInput}>
              {style => (
                <InputWrapper
                  label="verification code"
                  description="enter the code sent to your phone"
                  {...{ style }}
                >
                  <PinInput
                    {...getInputProps("code")}
                    length={6}
                    autoFocus
                    hiddenInputProps={{ autoComplete: "one-time-code" }}
                  />
                </InputWrapper>
              )}
            </Transition>
            <Button
              type="submit"
              leftSection={showCodeInput ? <SignInIcon /> : <PhoneIcon />}
              disabled={!stepComplete}
              loading={submitting}
            >
              {showCodeInput ? "sign in" : "send login code"}
            </Button>
          </Stack>
        </form>
      </Card.Section>
    </Card>
  );
};

LoginPage.layout = page => (
  <AppLayout title="Sign in">
    <Center style={{ flexGrow: 1 }}>{page}</Center>
  </AppLayout>
);

export default LoginPage;
