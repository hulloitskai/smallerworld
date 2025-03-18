import { InputBase, Text } from "@mantine/core";
import { hasLength } from "@mantine/form";
import { IMaskInput } from "react-imask";

import ProfileIcon from "~icons/heroicons/user-circle-20-solid";

import AppLayout from "~/components/AppLayout";
import HomeScreenPreview from "~/components/HomeScreenPreview";
import ImageInput from "~/components/ImageInput";
import { APPLE_ICON_RADIUS_RATIO, CANONICAL_DOMAIN } from "~/helpers/app";
import { type Image, type Upload } from "~/types";

export interface SignupPageProps extends SharedPageProps {}

const ICON_IMAGE_INPUT_SIZE = 110;

const SignupPage: PageComponent<SignupPageProps> = () => {
  const { values, getInputProps, submitting, submit, setFieldValue } = useForm({
    action: routes.signups.create,
    descriptor: "complete signup",
    initialValues: {
      name: "",
      prefixed_handle: "",
      page_icon_image: null as Upload | null,
    },
    transformValues: ({ prefixed_handle, page_icon_image, ...values }) => ({
      user: {
        ...values,
        handle: prefixed_handle.replace(/^@/, ""),
        page_icon: page_icon_image?.signedId ?? "",
      },
    }),
    validate: {
      name: hasLength(
        { min: 1, max: 30 },
        "Must be between 1 and 30 characters",
      ),
      prefixed_handle: (value: string) => {
        const handle = value.substring(1);
        if (handle.length < 5) {
          return "Must be at least 5 characters";
        }
      },
    },
    onSuccess: () => {
      router.visit(routes.home.show.path());
    },
  });
  const [pageIcon, setPageIcon] = useState<Image | null>(null);
  useEffect(() => {
    if (values.name) {
      const handle = values.name
        .toLocaleLowerCase()
        .replace(/[^a-z0-9_]/g, "_");
      setFieldValue("prefixed_handle", `@${handle}`);
    }
  }, [values.name]); // eslint-disable-line react-hooks/exhaustive-deps

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
              pageIcon={pageIcon}
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
                {...getInputProps("page_icon_image")}
                label="your page icon"
                center
                h={ICON_IMAGE_INPUT_SIZE}
                w={ICON_IMAGE_INPUT_SIZE}
                radius={ICON_IMAGE_INPUT_SIZE / APPLE_ICON_RADIUS_RATIO}
                required
                withAsterisk={false}
                onPreviewChange={setPageIcon}
              />
            </Stack>
            <Button
              type="submit"
              leftSection={<ProfileIcon />}
              loading={submitting}
              disabled={
                !values.name ||
                values.prefixed_handle.length <= 1 ||
                !values.page_icon_image
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

SignupPage.layout = page => (
  <AppLayout title="sign up">
    <Center style={{ flexGrow: 1 }}>{page}</Center>
  </AppLayout>
);

export default SignupPage;
