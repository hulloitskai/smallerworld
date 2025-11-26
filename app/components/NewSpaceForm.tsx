import ImageInput from "~/components/ImageInput";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { type Space, type Upload } from "~/types";

export interface NewSpaceFormProps extends BoxProps {
  onSpaceCreated?: (space: Space) => void;
}

const ICON_IMAGE_INPUT_SIZE = 140;

const NewSpaceForm: FC<NewSpaceFormProps> = ({
  className,
  onSpaceCreated,
  ...otherProps
}) => {
  const { values, getInputProps, submitting, submit } = useForm({
    action: routes.userSpaces.create,
    descriptor: "create space",
    initialValues: {
      name: "",
      description: "",
      icon_upload: null as Upload | null,
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
      onSpaceCreated?.(space);
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
            placeholder="new stadium"
            required
          />
          <Textarea
            {...getInputProps("description")}
            label="purpose"
            description="what do people write about in this space?"
            placeholder="a space to share project progress updates"
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
        </Stack>
        <Button
          type="submit"
          size="md"
          variant="filled"
          leftSection={<AddIcon />}
          loading={submitting}
          disabled={!values.name || !values.description}
        >
          create space
        </Button>
      </Stack>
    </Box>
  );
};

export default NewSpaceForm;
