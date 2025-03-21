import { ActionIcon, SegmentedControl, Text } from "@mantine/core";
import { type Editor } from "@tiptap/react";

import ImageIcon from "~icons/heroicons/photo-20-solid";

import {
  mutatePosts,
  POST_VISIBILITIES,
  POST_VISIBILITY_TO_ICON,
  POST_VISIBILITY_TO_LABEL,
} from "~/helpers/posts";
import { type Post, type PostType } from "~/types";

import EmojiPopover from "./EmojiPopover";
import ImageInput from "./ImageInput";
import LazyPostEditor from "./LazyPostEditor";

import classes from "./PostForm.module.css";

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
        }),
    initialValues,
    onSuccess: ({ post }) => {
      editorRef.current?.commands.clearContent();
      void mutatePosts();
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
          <SegmentedControl
            {...getInputProps("visibility")}
            orientation="vertical"
            size="xs"
            data={POST_VISIBILITIES.map(visibility => ({
              label: (
                <Tooltip
                  label={<>visible to {POST_VISIBILITY_TO_LABEL[visibility]}</>}
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
        </Stack>
        <Stack gap="xs" style={{ flexGrow: 1 }}>
          {!!postType && POST_TYPES_WITH_TITLE.includes(postType) && (
            <TextInput
              {...getInputProps("title")}
              placeholder={titlePlaceholder}
            />
          )}
          <LazyPostEditor
            {...getInputProps("body_html")}
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
          <Group justify="end">
            <Button
              type="submit"
              leftSection={post ? <SaveIcon /> : <SendIcon />}
              disabled={bodyTextEmpty || !isDirty()}
              loading={submitting}
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
