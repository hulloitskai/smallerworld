import { Input, ScrollArea, SegmentedControl, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMergedRef } from "@mantine/hooks";
import { type Editor } from "@tiptap/react";
import { type DraggableProps, motion, Reorder } from "motion/react";
import { useLongPress } from "use-long-press";

import NotifyIcon from "~icons/heroicons/bell";
import QuietIcon from "~icons/heroicons/bell-slash-20-solid";
import CalendarIcon from "~icons/heroicons/calendar-20-solid";
import ImageIcon from "~icons/heroicons/photo-20-solid";

import {
  mutatePosts,
  NONPRIVATE_POST_VISIBILITIES,
  POST_VISIBILITIES,
  POST_VISIBILITY_TO_ICON,
  POST_VISIBILITY_TO_LABEL,
} from "~/helpers/posts";
import { type PostFormValues, useNewPostDraft } from "~/helpers/posts/form";
import { type Post, type PostType, type Upload, type WorldPost } from "~/types";

import EmojiPopover from "./EmojiPopover";
import ImageInput, { type ImageInputProps } from "./ImageInput";
import LazyPostEditor from "./LazyPostEditor";
import QuotedPostCard from "./QuotedPostCard";

import classes from "./PostForm.module.css";
import "@mantine/dates/styles.layer.css";

export type PostFormProps = { pausedFriends: number } & (
  | {
      post: WorldPost;
      onPostUpdated?: (post: WorldPost) => void;
    }
  | {
      postType: PostType | null;
      quotedPost?: Post;
      onPostCreated?: (post: WorldPost) => void;
    }
);

const POST_TITLE_PLACEHOLDERS: Partial<Record<PostType, string>> = {
  journal_entry: "what a day!",
  poem: "the invisible mirror",
  invitation: "bake night 2!!",
};

const POST_TYPES_WITH_TITLE = Object.keys(POST_TITLE_PLACEHOLDERS);

const IMAGE_INPUT_SIZE = 140;

const POST_BODY_PLACEHOLDERS: Record<PostType, string> = {
  journal_entry: "today felt kind of surreal. almost like a dream...",
  poem: "broken silver eyes cry me a thousand mirrors\nbeautiful reflections of personal nightmares\nthe sort i save for my therapist's office\nand of course the pillowcase i water every night",
  invitation:
    "i'm going to https://lu.ma/2323 tonight! pls come out if you're free :)",
  question: "liberty village food recs??",
  follow_up: "um, actually...",
};

const PostForm: FC<PostFormProps> = ({ pausedFriends, ...otherProps }) => {
  const postType =
    "postType" in otherProps ? otherProps.postType : otherProps.post.type;
  const post = "post" in otherProps ? otherProps.post : null;
  const quotedPost =
    "quotedPost" in otherProps
      ? otherProps.quotedPost
      : (post?.quoted_post ?? undefined);

  const titlePlaceholder = postType
    ? POST_TITLE_PLACEHOLDERS[postType]
    : undefined;
  const bodyPlaceholder = postType
    ? POST_BODY_PLACEHOLDERS[postType]
    : undefined;

  // == Editor
  const editorRef = useRef<Editor | null>();

  // == New post draft
  const [newPostDraft, saveNewPostDraft, clearNewPostDraft] = useNewPostDraft();

  // == Form
  const initialValues = useMemo<PostFormValues>(() => {
    const { title, body_html, emoji, images, visibility, pinned_until } =
      post ?? {};
    return {
      title: title ?? "",
      body_html: body_html ?? "",
      emoji: emoji ?? "",
      images_uploads: images
        ? images.map<Upload>(image => ({ signedId: image.signed_id }))
        : [],
      visibility: visibility ?? "friends",
      pinned_until: pinned_until ?? "",
      quiet: !!post,
    };
  }, [post]);
  const {
    setFieldValue,
    insertListItem,
    removeListItem,
    getInputProps,
    submit,
    values,
    submitting,
    reset,
    setInitialValues,
    setValues,
    isDirty,
    errors,
  } = useForm<
    { post: WorldPost },
    PostFormValues,
    (values: PostFormValues) => { post: Record<string, any> }
  >({
    ...(post
      ? {
          action: routes.posts.update,
          params: { id: post.id },
          descriptor: "update post",
          transformValues: ({
            emoji,
            title,
            images_uploads,
            pinned_until,
            ...values
          }) => ({
            post: {
              ...omit(values, "quiet"),
              emoji: emoji || null,
              title: title || null,
              images: images_uploads.map(upload => upload.signedId),
              pinned_until: pinned_until
                ? formatDateString(pinned_until)
                : null,
            },
          }),
        }
      : {
          action: routes.posts.create,
          descriptor: "create post",
          transformValues: ({
            emoji,
            title,
            images_uploads,
            pinned_until,
            ...values
          }) => {
            invariant(postType, "Missing post type");
            return {
              post: {
                ...values,
                type: postType,
                emoji: emoji || null,
                title: POST_TYPES_WITH_TITLE.includes(postType)
                  ? title || null
                  : null,
                images: images_uploads.map(upload => upload.signedId),
                quoted_post_id: quotedPost?.id ?? null,
                pinned_until: pinned_until
                  ? formatDateString(pinned_until)
                  : null,
              },
            };
          },
          transformErrors: ({ image, ...errors }) => ({
            ...errors,
            image_upload: image,
          }),
        }),
    initialValues,
    onSuccess: ({ post }, { reset }) => {
      if (!("post" in otherProps)) {
        reset();
        editorRef.current?.commands.clearContent();
        clearNewPostDraft();
      }
      void mutatePosts();
      void mutateRoute(routes.posts.pinned);
      void mutateRoute(routes.encouragements.index);
      if ("onPostCreated" in otherProps) {
        otherProps.onPostCreated?.(post);
      } else if ("onPostUpdated" in otherProps) {
        otherProps.onPostUpdated?.(post);
      }
    },
  });
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps
  const { ref: formStackSizingRef, width: formStackWidth } =
    useElementSize<HTMLDivElement>();
  const formStackRef = useMergedRef(formStackSizingRef);

  // == Post visibilities
  const postVisibilities = postType
    ? ["invitation", "question"].includes(postType)
      ? NONPRIVATE_POST_VISIBILITIES
      : POST_VISIBILITIES
    : undefined;

  // == Pinned until
  const vaulPortalTarget = useVaulPortalTarget();
  const todayDate = useMemo(() => DateTime.now().toJSDate(), []);

  // == Body text empty state
  const [bodyTextEmpty, setBodyTextEmpty] = useState(true);

  // == Sync new post draft with form
  useEffect(() => {
    if (post || !postType || postType === "follow_up") {
      return;
    }
    if (newPostDraft?.postType === postType) {
      const { values } = newPostDraft;
      setValues(values);
      setTimeout(() => {
        const editor = editorRef.current;
        if (editor) {
          setBodyTextEmpty(editor.getText().trim() === "");
        }
      }, 10);
      return () => {
        reset();
      };
    }
  }, [newPostDraft?.postType, postType]); // eslint-disable-line react-hooks/exhaustive-deps
  useDidUpdate(() => {
    if (!post && !!postType && postType !== "follow_up" && isDirty()) {
      saveNewPostDraft({ postType, values });
    }
  }, [values]); // eslint-disable-line react-hooks/exhaustive-deps

  const hiddenFromCount = post ? post.hidden_from_count : pausedFriends;
  const [showImageInput, setShowImageInput] = useState(() => {
    if (newPostDraft) {
      return !isEmpty(newPostDraft.values.images_uploads);
    }
    if (post) {
      return !isEmpty(post.images);
    }
    return false;
  });
  const [newImageInputKey, setNewImageInputKey] = useState(0);
  return (
    <form onSubmit={submit}>
      <Group gap="xs" align="start" justify="center">
        <Stack gap="xs" align="center">
          <EmojiPopover
            position="right"
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
                    events={{ hover: true, focus: true, touch: true }}
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
          {!post && (
            <Tooltip
              label={
                values.quiet ? "don't send notifications" : "send notifications"
              }
              events={{ hover: true, focus: true, touch: true }}
              onClick={() => {
                setFieldValue("quiet", !values.quiet);
              }}
            >
              <ActionIcon
                color="gray"
                styles={{
                  icon: {
                    fontSize: "var(--mantine-spacing-sm)",
                  },
                }}
              >
                {values.quiet ? <QuietIcon /> : <NotifyIcon />}
              </ActionIcon>
            </Tooltip>
          )}
        </Stack>
        <Stack ref={formStackRef} gap="xs" style={{ flexGrow: 1 }}>
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
              {...getInputProps("body_html")}
              initialValue={initialValues?.body_html}
              placeholder={bodyPlaceholder}
              onEditorCreated={editor => {
                editorRef.current = editor;
                setBodyTextEmpty(editor.getText().trim() === "");
                if (!post && postType && postType !== "follow_up") {
                  if (newPostDraft?.postType === postType) {
                    editor.commands.setContent(newPostDraft.values.body_html);
                  } else {
                    editor.commands.clearContent();
                  }
                }
              }}
              onUpdate={({ editor }) => {
                setBodyTextEmpty(editor.getText().trim() === "");
              }}
            />
          </Input.Wrapper>
          {postType === "invitation" && (
            <DateInput
              {...getInputProps("pinned_until")}
              classNames={{
                root: classes.dateInput,
                day: classes.dateInputDay,
              }}
              placeholder="keep pinned until"
              leftSection={<CalendarIcon />}
              minDate={todayDate}
              error={errors.pinned_until}
              required
              withAsterisk={false}
              popoverProps={{
                portalProps: {
                  target: vaulPortalTarget,
                },
                position: "bottom",
              }}
              data-vaul-no-drag
            />
          )}
          {quotedPost ? (
            <QuotedPostCard post={quotedPost} />
          ) : (
            <>
              {showImageInput || !isEmpty(values.images_uploads) ? (
                <ScrollArea
                  scrollbars="x"
                  className={classes.imagesScrollArea}
                  w={formStackWidth}
                >
                  <Reorder.Group<Upload>
                    values={values.images_uploads}
                    axis="x"
                    layoutScroll
                    onReorder={uploads => {
                      setFieldValue("images_uploads", uploads);
                    }}
                  >
                    {values.images_uploads.map((upload, i) => (
                      <ReorderableImageInput
                        key={upload.signedId}
                        value={upload}
                        previewFit="contain"
                        onChange={value => {
                          if (value) {
                            setFieldValue(`images_uploads.${i}`, value);
                          } else {
                            removeListItem("images_uploads", i);
                          }
                        }}
                        h={IMAGE_INPUT_SIZE}
                        w={IMAGE_INPUT_SIZE}
                        draggable={values.images_uploads.length > 1}
                      />
                    ))}
                    {values.images_uploads.length < 4 && (
                      <motion.li
                        key={newImageInputKey}
                        layout="position"
                        layoutScroll
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <ImageInput
                          key={newImageInputKey}
                          onChange={value => {
                            if (value) {
                              insertListItem("images_uploads", value);
                              setNewImageInputKey(prev => prev + 1);
                            }
                          }}
                          h={IMAGE_INPUT_SIZE}
                          w={IMAGE_INPUT_SIZE}
                        />
                      </motion.li>
                    )}
                  </Reorder.Group>
                </ScrollArea>
              ) : (
                <Button
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
            </>
          )}
          <Group justify="end" mt="xs">
            {hiddenFromCount > 0 && (
              <Text size="xs" c="dimmed">
                hidden from {hiddenFromCount}{" "}
                {inflect("friend", hiddenFromCount)}
              </Text>
            )}
            <Button
              type="submit"
              variant="filled"
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

const formatDateString = (dateString: string): string => {
  const date = DateTime.fromISO(dateString, { zone: "local" });
  return date.toISO();
};

interface ReorderableImageInputProps
  extends ImageInputProps,
    Pick<DraggableProps, "drag"> {
  draggable: boolean;
}

const ReorderableImageInput: FC<ReorderableImageInputProps> = ({
  value,
  draggable,
  ...otherProps
}) => {
  const [dragging, setDragging] = useState(false);
  const longPressHandlers = useLongPress(() => {
    setDragging(true);
  });
  return (
    <Reorder.Item
      drag={draggable ? "x" : false}
      {...{ value }}
      onDragStart={() => {
        setDragging(true);
      }}
      onDragEnd={() => {
        setDragging(false);
      }}
      {...longPressHandlers}
    >
      <ImageInput
        {...{ value }}
        {...(dragging && { disabled: true, style: { cursor: "move" } })}
        {...otherProps}
      />
    </Reorder.Item>
  );
};
