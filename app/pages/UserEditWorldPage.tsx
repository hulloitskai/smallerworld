import { InputWrapper } from "@mantine/core";
import { hasLength } from "@mantine/form";

import AppLayout from "~/components/AppLayout";
import ImageInput from "~/components/ImageInput";
import WorldHomescreenPreview from "~/components/WorldHomescreenPreview";
import WorldThemeRadioGroup from "~/components/WorldThemeRadioGroup";
import { imageUpload } from "~/helpers/uploads";
import { worldManifestUrlForUser } from "~/helpers/userWorld";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { isWorldTheme } from "~/helpers/worldThemes";
import { type Image, type User, type World } from "~/types";

import classes from "./UserEditWorldPage.module.css";

export interface UserEditWorldPageProps extends SharedPageProps {
  currentUser: User;
  world: World;
}

const ICON_IMAGE_INPUT_SIZE = 110;

const UserEditWorldPage: PageComponent<UserEditWorldPageProps> = ({
  currentUser,
  world,
}) => {
  // == Form
  const { values, getInputProps, submitting, submit, isDirty, watch } = useForm(
    {
      action: routes.userWorld.update,
      descriptor: "update page",
      initialValues: {
        ...pick(currentUser, "name", "allow_space_replies"),
        ...pick(world, "hide_stats", "hide_neko", "allow_friend_sharing"),
        icon_upload: world.icon ? imageUpload(world.icon) : null,
        theme: world.theme ?? "",
      },
      transformValues: ({
        icon_upload,
        theme,
        name,
        allow_space_replies,
        ...otherValues
      }) => ({
        world: {
          icon: icon_upload?.signedId ?? "",
          theme: theme || null,
          ...otherValues,
          owner_attributes: { name, allow_space_replies },
        },
      }),
      transformErrors: ({
        icon: icon_upload,
        "owner.name": name,
        "owner.allow_space_replies": allow_space_replies,
        ...errors
      }) => ({
        ...errors,
        name,
        allow_space_replies,
        icon_upload,
      }),
      validate: {
        name: hasLength({ max: 30 }, "Must be less than 30 characters"),
      },
      onSuccess: () => {
        const worldPath = withTrailingSlash(routes.userWorld.show.path());
        startTransition(() => {
          router.visit(worldPath);
        });
      },
    },
  );

  // == World theme preview
  const worldTheme = useWorldTheme(
    isWorldTheme(values.theme) ? values.theme : null,
  );

  // == World icon preview
  const [iconPreview, setIconPreview] = useState<Image | null>(
    () => world.icon,
  );
  watch("icon_upload", ({ value }) => {
    if (!value) {
      setIconPreview(null);
    }
  });

  return (
    <Stack w="100%" maw={380}>
      <Button
        component={Link}
        href={withTrailingSlash(routes.userWorld.show.path())}
        leftSection={<BackIcon />}
        style={{ alignSelf: "center" }}
        {...(worldTheme === "bakudeku" && {
          variant: "filled",
        })}
      >
        back to your world
      </Button>
      <Card withBorder>
        <Card.Section inheritPadding withBorder py="md">
          <Stack align="center" gap={8}>
            <Title size="h4" lh="xs" ta="center">
              customize your world
            </Title>
            <Stack gap={4} align="center">
              <WorldHomescreenPreview
                world={{
                  owner_name: values.name,
                  icon: iconPreview ?? undefined,
                }}
                arrowLabel="your world!"
                loading={!!values.icon_upload && !iconPreview}
              />
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
                <ImageInput
                  {...getInputProps("icon_upload")}
                  cropToAspect={1}
                  label="your world's icon"
                  center
                  h={ICON_IMAGE_INPUT_SIZE}
                  w={ICON_IMAGE_INPUT_SIZE}
                  radius={ICON_IMAGE_INPUT_SIZE / WORLD_ICON_RADIUS_RATIO}
                  required
                  withAsterisk={false}
                  onPreviewChange={setIconPreview}
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
                    label="perception anxiety mode (hides post reactions and view counts)"
                    radius="md"
                  />
                  <Checkbox
                    {...getInputProps("hide_neko", { type: "checkbox" })}
                    label="no pets in my smaller world pls 🚫🐈"
                    radius="md"
                  />
                  <Checkbox
                    {...getInputProps("allow_space_replies", {
                      type: "checkbox",
                    })}
                    label="allow space replies"
                    radius="md"
                  />
                </InputWrapper>
              </Stack>
              <Button
                type="submit"
                size="md"
                variant="filled"
                leftSection={<SaveIcon />}
                loading={submitting}
                disabled={!isDirty() || !values.name || !values.icon_upload}
              >
                save changes
              </Button>
            </Stack>
          </form>
        </Card.Section>
      </Card>
    </Stack>
  );
};

UserEditWorldPage.layout = page => (
  <AppLayout<UserEditWorldPageProps>
    title="customize your page"
    manifestUrl={({ currentUser }) => worldManifestUrlForUser(currentUser)}
    pwaScope={withTrailingSlash(routes.userWorld.show.path())}
  >
    <Center>{page}</Center>
  </AppLayout>
);

export default UserEditWorldPage;
