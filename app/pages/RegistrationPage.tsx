import { InputBase, InputWrapper, Text } from "@mantine/core";
import { hasLength } from "@mantine/form";
import { IMaskInput } from "react-imask";

import ProfileIcon from "~icons/heroicons/user-circle-20-solid";

import AppLayout from "~/components/AppLayout";
import ImageInput from "~/components/ImageInput";
import WorldHomescreenPreview from "~/components/WorldHomescreenPreview";
import WorldThemeRadioGroup from "~/components/WorldThemeRadioGroup";
import { CANONICAL_DOMAIN } from "~/helpers/app";
import { currentTimeZone } from "~/helpers/time";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { isWorldTheme } from "~/helpers/worldThemes";
import { type Image, type Upload } from "~/types";

import classes from "./RegistrationPage.module.css";

export interface RegistrationPageProps extends SharedPageProps {}

const ICON_IMAGE_INPUT_SIZE = 110;

const RegistrationPage: PageComponent<RegistrationPageProps> = () => {
  const { url: pagePath } = usePage();
  const currentUser = useCurrentUser();

  // == Form
  const [shouldDeriveHandle, setShouldDeriveHandle] = useState(true);
  const { values, getInputProps, submitting, submit, setFieldValue } = useForm({
    action: routes.registrations.create,
    descriptor: "complete signup",
    initialValues: {
      name: currentUser?.name ?? "",
      prefixed_handle: "",
      icon_upload: null as Upload | null,
      theme: "",
      hide_stats: false,
      hide_neko: false,
      allow_friend_sharing: false,
    },
    transformValues: ({
      prefixed_handle,
      icon_upload,
      hide_stats,
      hide_neko,
      allow_friend_sharing,
      theme,
      name,
    }) => ({
      user: {
        name,
        time_zone: currentTimeZone(),
        world_attributes: {
          handle: prefixed_handle.replace(/^@/, ""),
          icon: icon_upload?.signedId ?? "",
          hide_stats,
          hide_neko,
          allow_friend_sharing,
          theme: theme || null,
        },
      },
    }),
    transformErrors: ({
      "world.handle": prefixed_handle,
      "world.icon": icon_upload,
      "world.theme": theme,
      "world.allow_friend_sharing": allow_friend_sharing,
      "world.hide_stats": hide_stats,
      "world.hide_neko": hide_neko,
      ...errors
    }) => ({
      ...errors,
      prefixed_handle,
      icon_upload,
      theme,
      allow_friend_sharing,
      hide_stats,
      hide_neko,
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
      // NOTE: Use location.href instead of router.visit in order to force
      // browser to load new page metadata for pin-to-homescreen + PWA
      // detection.
      const worldPath = withTrailingSlash(
        routes.userWorld.show.path({
          query: {
            ...queryParamsFromPath(pagePath),
            intent: "install",
          },
        }),
      );
      location.href = worldPath;
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

  // == World theme preview
  useWorldTheme(isWorldTheme(values.theme) ? values.theme : null);

  // == World icon preview
  const [iconPreview, setPageIconPreview] = useState<Image | null>(null);

  const submitDisabled =
    !values.name || values.prefixed_handle.length <= 1 || !values.icon_upload;
  return (
    <Card w="100%" maw={380} withBorder>
      <Card.Section inheritPadding withBorder py="md">
        <Stack align="center" gap={8}>
          <Title size="h4" lh="xs" ta="center">
            let&apos;s create your world :)
          </Title>
          <Stack align="center" gap={6} my="sm">
            <WorldHomescreenPreview
              world={{
                icon: iconPreview ?? undefined,
                owner_name: values.name,
              }}
              arrowLabel="your world!"
            />
            <Text ta="center" size="xs" c="dimmed" fw={600}>
              pov: your friend&apos;s homescreen in 10 minutes
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
                        your world will live at:{" "}
                        <Text span inherit c="primary">
                          {CANONICAL_DOMAIN}/{values.prefixed_handle}
                        </Text>
                      </Text>
                    )}
                  </Stack>
                )}
                required
              />
              <ImageInput
                {...getInputProps("icon_upload")}
                label="your world's icon"
                cropToAspect={1}
                center
                h={ICON_IMAGE_INPUT_SIZE}
                w={ICON_IMAGE_INPUT_SIZE}
                radius={ICON_IMAGE_INPUT_SIZE / WORLD_ICON_RADIUS_RATIO}
                required
                onPreviewChange={setPageIconPreview}
              />
              <WorldThemeRadioGroup {...getInputProps("theme")} />
              <InputWrapper
                className={classes.advancedSettingsWrapper}
                label="advanced settings"
              >
                <Checkbox
                  {...getInputProps("allow_friend_sharing", {
                    type: "checkbox",
                  })}
                  label="allow invited friends to share your posts"
                  radius="md"
                />
                <Checkbox
                  {...getInputProps("hide_stats", { type: "checkbox" })}
                  label="perception anxiety mode (hides reaction counts and # of friends notified)"
                  radius="md"
                />
                <Checkbox
                  {...getInputProps("hide_neko", { type: "checkbox" })}
                  label="no pets in my smaller world pls 🚫🐈"
                  radius="md"
                />
              </InputWrapper>
            </Stack>
            <Stack gap={6}>
              <Button
                type="submit"
                variant="filled"
                leftSection={<ProfileIcon />}
                loading={submitting}
                disabled={submitDisabled}
              >
                complete signup
              </Button>
              <Text
                size="xs"
                c="dimmed"
                ta="center"
                maw={240}
                style={{ alignSelf: "center" }}
              >
                by continuing, you agree to our{" "}
                <Anchor
                  component={Link}
                  href={routes.policies.show.path({
                    query: {
                      referrer: "signup",
                    },
                  })}
                  fw={600}
                  opacity={0.8}
                  style={{ whiteSpace: "nowrap" }}
                >
                  usage and privacy policies
                </Anchor>
              </Text>
            </Stack>
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
