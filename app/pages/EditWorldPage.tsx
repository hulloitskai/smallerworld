import { InputWrapper, Text } from "@mantine/core";
import { hasLength } from "@mantine/form";

import AppLayout from "~/components/AppLayout";
import HomeScreenPreview from "~/components/HomescreenPreview";
import ImageInput from "~/components/ImageInput";
import UserThemeRadioGroup from "~/components/UserThemeRadioGroup";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { type Image, type Upload, type User } from "~/types";

import classes from "./EditWorldPage.module.css";

export interface EditWorldPageProps extends SharedPageProps {
  currentUser: User;
  hideStats: boolean;
  hideNeko: boolean;
  allowFriendSharing: boolean;
}

const ICON_IMAGE_INPUT_SIZE = 110;

const EditWorldPage: PageComponent<EditWorldPageProps> = ({
  currentUser,
  hideStats,
  hideNeko,
  allowFriendSharing,
}) => {
  // == Form
  const initialValues = useMemo(
    () => ({
      name: currentUser.name,
      page_icon_upload: {
        signedId: currentUser.page_icon.signed_id,
      } as Upload | null,
      theme: currentUser.theme ?? ("" as const),
      hide_stats: hideStats,
      hide_neko: hideNeko,
      allow_friend_sharing: allowFriendSharing,
    }),
    [currentUser, hideStats, hideNeko, allowFriendSharing],
  );
  const { values, getInputProps, submitting, submit, isDirty } = useForm({
    action: routes.world.update,
    descriptor: "update page",
    initialValues,
    transformValues: ({ page_icon_upload, theme, ...values }) => ({
      user: {
        ...values,
        page_icon: page_icon_upload?.signedId ?? "",
        theme: theme || null,
      },
    }),
    transformErrors: ({ page_icon, ...errors }) => ({
      ...errors,
      page_icon_upload: page_icon,
    }),
    validate: {
      name: hasLength({ max: 30 }, "Must be less than 30 characters"),
    },
    onSuccess: () => {
      router.visit(routes.world.show.path());
    },
  });

  // == User theme preview
  useUserTheme(values.theme || null);

  // == Page icon preview
  const [pageIconPreview, setPageIconPreview] = useState<Image | null>(
    () => currentUser.page_icon,
  );

  return (
    <Stack w="100%" maw={380}>
      <Button
        component={Link}
        href={routes.world.show.path()}
        leftSection={<BackIcon />}
        style={{ alignSelf: "center" }}
      >
        back to your world
      </Button>
      <Card withBorder>
        <Card.Section inheritPadding withBorder py="md">
          <Stack align="center" gap={8}>
            <Title size="h4" lh="xs" ta="center">
              edit your page
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
                </InputWrapper>
              </Stack>
              <Button
                type="submit"
                leftSection={<SaveIcon />}
                loading={submitting}
                disabled={
                  !isDirty() || !values.name || !values.page_icon_upload
                }
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

EditWorldPage.layout = page => (
  <AppLayout title="customize your page">
    <Center>{page}</Center>
  </AppLayout>
);

export default EditWorldPage;
