import { Input, SegmentedControl, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { type Editor } from "@tiptap/react";

import CalendarIcon from "~icons/heroicons/calendar-20-solid";
import ImageIcon from "~icons/heroicons/photo-20-solid";

import {
  mutatePosts,
  NONPRIVATE_POST_VISIBILITIES,
  POST_VISIBILITIES,
  POST_VISIBILITY_TO_ICON,
  POST_VISIBILITY_TO_LABEL,
} from "~/helpers/posts";
import { type Post, type PostType } from "~/types";

import EmojiPopover from "./EmojiPopover";
import ImageInput from "./ImageInput";
import LazyPostEditor from "./LazyPostEditor";

import classes from "./PostForm.module.css";
import "@mantine/dates/styles.layer.css";

type PostFormProps =
  | {
      post: Post;
      onPostUpdated?: (post: Post) => void;
    }
  | {
      postType: PostType | null;
      onPostCreated?: (post: Post) => void;
    };

const POST_TITLE_PLACEHOLDERS: Partial<Record<PostType, string>> = {
  journal_entry: "february 13, 2025",
  poem: "the invisible mirror",
  invitation: "bake night 2!!",
};

const POST_TYPES_WITH_TITLE = Object.keys(POST_TITLE_PLACEHOLDERS);

const POST_BODY_PLACEHOLDERS: Record<PostType, string> = {
  journal_entry: "today felt kind of surreal. almost like a dream...",
  poem: "broken silver eyes cry me a thousand mirrors\nbeautiful reflections of personal nightmares\nthe sort i save for my therapist's office\nand of course the pillowcase i water every night",
  invitation:
    "i'm going to https://lu.ma/2323 tonight! pls come out if you're free :)",
  question: "liberty village food recs??",
};

const PostForm: FC<PostFormProps> = props => {
  const postType = "postType" in props ? props.postType : props.post.type;
  const post = "post" in props ? props.post : null;

  const titlePlaceholder = postType
    ? POST_TITLE_PLACEHOLDERS[postType]
    : undefined;
  const bodyPlaceholder = postType
    ? POST_BODY_PLACEHOLDERS[postType]
    : undefined;

  // == Editor
  const editorRef = useRef<Editor | null>();

  // == Form
  const initialValues = useMemo(
    () => ({
      title: post?.title ?? "",
      body_html: post?.body_html ?? "",
      emoji: post?.emoji ?? "",
      image_upload: post?.image ? { signedId: post.image.signed_id } : null,
      visibility: post?.visibility ?? "friends",
      pinned_until: post?.pinned_until ?? "",
    }),
    [post],
  );
  type FormValues = typeof initialValues;
  const {
    setFieldValue,
    getInputProps,
    submit,
    values,
    submitting,
    reset,
    setInitialValues,
    isDirty,
    errors,
  } = useForm<
    { post: Post },
    FormValues,
    (values: FormValues) => { post: Record<string, any> }
  >({
    ...(post
      ? {
          action: routes.posts.update,
          params: { id: post.id },
          descriptor: "update post",
          transformValues: ({ title, image_upload, ...values }) => ({
            post: {
              ...values,
              title: title || null,
              image: image_upload?.signedId ?? null,
            },
          }),
        }
      : {
          action: routes.posts.create,
          descriptor: "create post",
          transformValues: ({ title, image_upload, ...values }) => ({
            post: {
              ...values,
              type: postType,
              title: title || null,
              image: image_upload?.signedId ?? null,
            },
          }),
          transformErrors: ({ image, ...errors }) => ({
            ...errors,
            image_upload: image,
          }),
        }),
    initialValues,
    onSuccess: ({ post }, { reset }) => {
      if (!("post" in props)) {
        reset();
        editorRef.current?.commands.clearContent();
      }
      void mutatePosts();
      void mutateRoute(routes.posts.pinned);
      if ("onPostCreated" in props) {
        props.onPostCreated?.(post);
      } else if ("onPostUpdated" in props) {
        props.onPostUpdated?.(post);
      }
    },
  });
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  // == Post visibilities
  const postVisibilities = postType
    ? ["invitation", "question"].includes(postType)
      ? NONPRIVATE_POST_VISIBILITIES
      : POST_VISIBILITIES
    : undefined;

  // == Pinned until
  const vaulPortalTarget = useVaulPortalTarget();
  const todayDate = useMemo(() => DateTime.now().toJSDate(), []);
  const pinnedUntil = useMemo(() => {
    if (values.pinned_until) {
      return DateTime.fromISO(values.pinned_until).toJSDate();
    }
  }, [values.pinned_until]);

  const [showImageInput, setShowImageInput] = useState(false);
  const [bodyTextEmpty, setBodyTextEmpty] = useState(true);
  return (
    <form onSubmit={submit}>
      <Group gap="xs" align="start" justify="center">
        <Stack gap="xs">
          <EmojiPopover
            onEmojiClick={({ emoji }) => {
              setFieldValue("emoji", emoji);
            }}
          >
            {({ open, opened }) => (
              <ActionIcon
                className={classes.emojiButton}
                variant="default"
                size={36}
                mod={{ opened }}
                onClick={() => {
                  if (values.emoji) {
                    setFieldValue("emoji", "");
                  } else {
                    open();
                  }
                }}
              >
                {values.emoji ? (
                  <Text size="xl">{values.emoji}</Text>
                ) : (
                  <Box
                    component={EmojiIcon}
                    c="var(--mantine-color-placeholder)"
                  />
                )}
              </ActionIcon>
            )}
          </EmojiPopover>
          {postVisibilities && (
            <SegmentedControl
              {...getInputProps("visibility")}
              className={classes.visibilitySegmentedControl}
              orientation="vertical"
              size="xs"
              data={postVisibilities.map(visibility => ({
                label: (
                  <Tooltip
                    label={
                      <>visible to {POST_VISIBILITY_TO_LABEL[visibility]}</>
                    }
                    position="right"
                    withArrow
                  >
                    <Center h={20}>
                      <Box component={POST_VISIBILITY_TO_ICON[visibility]} />
                    </Center>
                  </Tooltip>
                ),
                value: visibility,
              }))}
            />
          )}
        </Stack>
        <Stack gap="xs" style={{ flexGrow: 1 }}>
          {!!postType && POST_TYPES_WITH_TITLE.includes(postType) && (
            <TextInput
              {...getInputProps("title")}
              {...(!!titlePlaceholder && {
                placeholder: `(optional) ${titlePlaceholder}`,
              })}
              styles={{
                input: {
                  fontFamily: "var(--mantine-font-family-headings)",
                },
              }}
            />
          )}
          <Input.Wrapper error={errors.body_html}>
            <LazyPostEditor
              initialValue={initialValues?.body_html}
              placeholder={bodyPlaceholder}
              onEditorCreated={editor => {
                editorRef.current = editor;
                setBodyTextEmpty(editor.getText().trim() === "");
              }}
              onUpdate={({ editor }) => {
                setBodyTextEmpty(editor.getText().trim() === "");
              }}
            />
          </Input.Wrapper>
          {showImageInput || values.image_upload ? (
            <ImageInput
              {...getInputProps("image_upload")}
              previewFit="contain"
              h={140}
            />
          ) : (
            <Button
              color="gray"
              size="compact-sm"
              style={{ alignSelf: "center" }}
              leftSection={<ImageIcon />}
              onClick={() => {
                setShowImageInput(true);
              }}
            >
              attach an image
            </Button>
          )}
          <Group gap="xs" align="start" justify="end" mt="xs">
            {postType === "invitation" && (
              <DateInput
                placeholder="keep pinned until"
                leftSection={<CalendarIcon />}
                value={pinnedUntil}
                error={errors.pinned_until}
                required
                withAsterisk={false}
                popoverProps={{
                  portalProps: {
                    target: vaulPortalTarget,
                  },
                  position: "bottom",
                }}
                styles={{
                  root: {
                    flexGrow: 1,
                    maxWidth: 190,
                  },
                  input: {
                    textTransform: "lowercase",
                  },
                }}
                minDate={todayDate}
                onChange={date => {
                  setFieldValue(
                    "pinned_until",
                    date
                      ? DateTime.fromJSDate(date)
                          .set({ hour: 23, minute: 59, second: 59 })
                          .toISO()
                      : "",
                  );
                }}
              />
            )}
            <Button
              type="submit"
              leftSection={post ? <SaveIcon /> : <SendIcon />}
              disabled={bodyTextEmpty || !isDirty()}
              loading={submitting}
              style={{ flexShrink: 0 }}
            >
              {post ? "save" : "post"}
            </Button>
          </Group>
        </Stack>
      </Group>
    </form>
  );
};

export default PostForm;
