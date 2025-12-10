import ImageInput from "~/components/ImageInput";
import { imageUpload } from "~/helpers/uploads";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { type Space } from "~/types";

export interface EditSpaceFormProps extends BoxProps {
  space: Space;
  onSpaceUpdated?: (space: Space) => void;
}

const ICON_IMAGE_INPUT_SIZE = 140;

const EditSpaceForm: FC<EditSpaceFormProps> = ({
  className,
  space,
  onSpaceUpdated,
  ...otherProps
}) => {
  const { values, getInputProps, submitting, submit, isDirty } = useForm({
    action: routes.userSpaces.update,
    params: { id: space.id },
    descriptor: "update space",
    initialValues: {
      name: space.name,
      description: space.description,
      icon_upload: space.icon ? imageUpload(space.icon) : null,
      public: space.public,
    },
    transformValues: ({ name, description, icon_upload }) => ({
      space: {
        name,
        description,
        icon: icon_upload?.signedId ?? "",
      },
    }),
    transformErrors: ({ icon: icon_upload, ...errors }) => ({
      ...errors,
      icon_upload,
    }),
    onSuccess: ({ space }: { space: Space }) => {
      void mutateRoute(routes.userSpaces.index);
      onSpaceUpdated?.(space);
    },
  });

  return (
    <Box
      component="form"
      onSubmit={submit}
      className={cn("NewSpaceForm", className)}
      {...otherProps}
    >
      <Stack gap="md">
        <Stack gap="xs">
          <TextInput
            {...getInputProps("name")}
            label="your space's name"
            placeholder={space.name}
            required
          />
          <Textarea
            {...getInputProps("description")}
            label="purpose"
            description="what do people write about in this space?"
            placeholder={space.description}
            minRows={3}
            autosize
            required
          />
          <ImageInput
            {...getInputProps("icon_upload")}
            label="icon (optional)"
            cropToAspect={1}
            center
            h={ICON_IMAGE_INPUT_SIZE}
            w={ICON_IMAGE_INPUT_SIZE}
            radius={ICON_IMAGE_INPUT_SIZE / WORLD_ICON_RADIUS_RATIO}
          />
          <Checkbox
            {...getInputProps("public", { type: "checkbox" })}
            label="show on spaces tab for all users"
          />
        </Stack>
        <Button
          type="submit"
          size="md"
          variant="filled"
          leftSection={<SaveIcon />}
          loading={submitting}
          disabled={!isDirty() || !values.name || !values.description}
        >
          save changes
        </Button>
      </Stack>
    </Box>
  );
};

export default EditSpaceForm;
