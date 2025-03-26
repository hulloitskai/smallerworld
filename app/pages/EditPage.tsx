import { Text } from "@mantine/core";
import { hasLength } from "@mantine/form";

import ProfileIcon from "~icons/heroicons/user-circle-20-solid";

import AppLayout from "~/components/AppLayout";
import HomeScreenPreview from "~/components/HomeScreenPreview";
import ImageInput from "~/components/ImageInput";
import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { type Image, type Upload, type User } from "~/types";

export interface EditPageProps extends SharedPageProps {
  currentUser: User;
}

const ICON_IMAGE_INPUT_SIZE = 110;

const EditPage: PageComponent<EditPageProps> = ({ currentUser }) => {
  const initialValues = useMemo(
    () => ({
      name: currentUser.name,
      page_icon_upload: { signedId: currentUser.page_icon.signed_id } as Upload,
    }),
    [currentUser],
  );
  const { values, getInputProps, submitting, submit, isDirty } = useForm({
    action: routes.signup.update,
    descriptor: "update page",
    initialValues,
    transformValues: ({ page_icon_upload, ...values }) => ({
      user: {
        ...values,
        page_icon: page_icon_upload?.signedId ?? "",
      },
    }),
    validate: {
      name: hasLength({ max: 30 }, "Must be less than 30 characters"),
    },
    onSuccess: () => {
      router.visit(routes.world.show.path());
    },
  });
  const [pageIcon, setPageIcon] = useState<Image | null>(
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
                <ImageInput
                  {...getInputProps("page_icon_upload")}
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

EditPage.layout = page => (
  <AppLayout title="edit your page">
    <Center>{page}</Center>
  </AppLayout>
);

export default EditPage;
