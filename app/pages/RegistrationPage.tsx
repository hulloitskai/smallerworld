import { InputBase, InputWrapper, Text } from "@mantine/core";
import { hasLength } from "@mantine/form";
import { IMaskInput } from "react-imask";

import ProfileIcon from "~icons/heroicons/user-circle-20-solid";

import AppLayout from "~/components/AppLayout";
import HomeScreenPreview from "~/components/HomescreenPreview";
import ImageInput from "~/components/ImageInput";
import UserThemeRadioGroup from "~/components/UserThemeRadioGroup";
import { CANONICAL_DOMAIN } from "~/helpers/app";
import { useTimeZone } from "~/helpers/time";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { type Image, type Upload, type UserTheme } from "~/types";

export interface RegistrationPageProps extends SharedPageProps {}

const ICON_IMAGE_INPUT_SIZE = 110;

const RegistrationPage: PageComponent<RegistrationPageProps> = () => {
  // == Time zone
  const timeZone = useTimeZone();

  // == Form
  const [shouldDeriveHandle, setShouldDeriveHandle] = useState(true);
  const { values, getInputProps, submitting, submit, setFieldValue } = useForm({
    action: routes.registration.create,
    descriptor: "complete signup",
    initialValues: {
      name: "",
      prefixed_handle: "",
      page_icon_upload: null as Upload | null,
      theme: "" as UserTheme | "",
      hide_stats: false,
    },
    transformValues: ({ prefixed_handle, page_icon_upload, ...values }) => {
      invariant(timeZone, "Missing time zone");
      return {
        user: {
          ...values,
          handle: prefixed_handle.replace(/^@/, ""),
          page_icon: page_icon_upload?.signedId ?? "",
          time_zone_name: timeZone,
        },
      };
    },
    transformErrors: ({ page_icon, handle, ...errors }) => ({
      ...errors,
      prefixed_handle: handle,
      page_icon_upload: page_icon,
    }),
    validate: {
      name: hasLength({ max: 30 }, "Must be less than 30 characters"),
      prefixed_handle: (value: string) => {
        const handle = value.substring(1);
        if (handle.length < 2) {
          return "Must be at least 2 characters";
        }
      },
    },
    onSuccess: () => {
      router.visit(routes.world.show.path());
    },
  });
  useEffect(() => {
    if (values.name && shouldDeriveHandle) {
      const handle = values.name
        .toLocaleLowerCase()
        .replace(/[^a-z0-9_]/g, "_");
      setFieldValue("prefixed_handle", "@" + handle);
    }
  }, [values.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // == User theme preview
  useUserTheme(values.theme || null);

  // == Page icon preview
  const [pageIconPreview, setPageIconPreview] = useState<Image | null>(null);

  return (
    <Card w="100%" maw={380} withBorder>
      <Card.Section inheritPadding withBorder py="md">
        <Stack align="center" gap={8}>
          <Title size="h4" lh="xs" ta="center">
            let&apos;s build your page :)
          </Title>
          <Stack gap={4} align="center">
            <HomeScreenPreview
              pageName={values.name}
              pageIcon={pageIconPreview}
              arrowLabel="your page!"
            />
            <Text ta="center" size="xs" c="dimmed" fw={600}>
              pov: your friend's homescreen in 10 minutes
            </Text>
          </Stack>
        </Stack>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <form onSubmit={submit}>
          <Stack gap="md">
            <Stack gap="xs">
              <TextInput
                {...getInputProps("name")}
                label="your name"
                placeholder="jimmy"
                required
                withAsterisk={false}
              />
              <InputBase
                {...getInputProps("prefixed_handle")}
                component={IMaskInput}
                mask={/^@[a-z0-9_]*$/}
                prepare={value => {
                  if (value && !value.startsWith("@")) {
                    return "@" + value;
                  }
                  return value;
                }}
                onAccept={value => {
                  setFieldValue("prefixed_handle", value);
                }}
                onInput={({ currentTarget }) => {
                  setShouldDeriveHandle(!currentTarget.value);
                }}
                label="your handle"
                description="numbers, letters, and underscores only"
                placeholder="@bonobo"
                inputContainer={children => (
                  <Stack gap={2}>
                    {children}
                    {!!values.prefixed_handle && (
                      <Text size="xs" c="dimmed">
                        your page will live at:{" "}
                        <Text span inherit c="primary">
                          {CANONICAL_DOMAIN}/{values.prefixed_handle}
                        </Text>
                      </Text>
                    )}
                  </Stack>
                )}
                required
                withAsterisk={false}
              />
              <ImageInput
                {...getInputProps("page_icon_upload")}
                label="your page icon"
                center
                h={ICON_IMAGE_INPUT_SIZE}
                w={ICON_IMAGE_INPUT_SIZE}
                radius={ICON_IMAGE_INPUT_SIZE / USER_ICON_RADIUS_RATIO}
                required
                withAsterisk={false}
                onPreviewChange={setPageIconPreview}
              />
              <UserThemeRadioGroup {...getInputProps("theme")} />
              <InputWrapper
                label="advanced settings"
                styles={{
                  label: {
                    marginTop: "var(--mantine-spacing-xs)",
                    marginBottom: rem(4),
                  },
                }}
              >
                <Checkbox
                  {...getInputProps("hide_stats", { type: "checkbox" })}
                  label="perception anxiety mode (hides reaction counts and # of friends notified)"
                  radius="md"
                />
              </InputWrapper>
            </Stack>
            <Button
              type="submit"
              leftSection={<ProfileIcon />}
              loading={submitting}
              disabled={
                !timeZone ||
                !values.name ||
                values.prefixed_handle.length <= 1 ||
                !values.page_icon_upload
              }
            >
              complete signup
            </Button>
          </Stack>
        </form>
      </Card.Section>
    </Card>
  );
};

RegistrationPage.layout = page => (
  <AppLayout title="sign up">
    <Center style={{ flexGrow: 1 }}>{page}</Center>
  </AppLayout>
);

export default RegistrationPage;
