import { Input, InputBase, PinInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import parsePhone from "phone";
import { IMaskInput } from "react-imask";

import AppLayout from "~/components/AppLayout";
import { createSupabaseClient } from "~/helpers/supabase";

export interface LoginPageProps extends SharedPageProps {}

const LoginPage: PageComponent<LoginPageProps> = () => {
  // == Form
  const [showCodeInput, setShowCodeInput] = useState(false);
  const {
    values,
    getInputProps,
    onSubmit,
    submitting,
    setSubmitting,
    setFieldValue,
  } = useForm({
    initialValues: {
      country_code: "+1",
      phone_without_country_code: "",
      code: "",
    },
  });
  const stepComplete = useMemo(() => {
    const { phone_without_country_code, country_code, code } = values;
    if (showCodeInput) {
      return !!code && !!phone_without_country_code && !!country_code;
    }
    return !!phone_without_country_code && !!country_code;
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
            ({ phone_without_country_code, country_code, code }) => {
              const supabase = createSupabaseClient();
              const { phoneNumber } = parsePhone(
                [country_code, phone_without_country_code].join(" "),
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
                      console.error("failed to complete sign-in", error);
                      toast.error("failed to complete sign-in", {
                        description: error.message,
                      });
                    } else {
                      router.visit(routes.world.show.path());
                    }
                  })
                  .catch(error => {
                    console.error("unexpected error during sign-in", error);
                    if (error instanceof Error) {
                      toast.error("unexpected error during sign-in", {
                        description: error.message,
                      });
                    }
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
                      console.error("failed to initiate sign-in", error);
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
                    withAsterisk={false}
                    w={60}
                  />
                  {children}
                </Group>
              )}
            />
            <Transition transition="pop" mounted={showCodeInput}>
              {style => (
                <Input.Wrapper
                  label="verification code"
                  description="enter the code sent to your phone"
                  {...{ style }}
                >
                  <PinInput
                    {...getInputProps("code")}
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
                leftSection={showCodeInput ? <SignInIcon /> : <PhoneIcon />}
                disabled={!stepComplete}
                loading={submitting}
              >
                {showCodeInput ? "sign in" : "send login code"}
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
