import { Input, ScrollArea, SegmentedControl, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useLongPress, useMergedRef } from "@mantine/hooks";
import { type Editor } from "@tiptap/react";
import { type DraggableProps, motion, Reorder } from "motion/react";

import NotifyIcon from "~icons/heroicons/bell";
import QuietIcon from "~icons/heroicons/bell-slash-20-solid";
import CalendarIcon from "~icons/heroicons/calendar-20-solid";
import ImageIcon from "~icons/heroicons/photo-20-solid";

import { prettyFriendName } from "~/helpers/friends";
import {
  mutateWorldPosts,
  NONPRIVATE_POST_VISIBILITIES,
  POST_VISIBILITIES,
  POST_VISIBILITY_TO_ICON,
  POST_VISIBILITY_TO_LABEL,
} from "~/helpers/posts";
import { type PostFormValues, usePostDraftValues } from "~/helpers/posts/form";
import { useWorldFriends } from "~/helpers/world";
import {
  type Encouragement,
  type Post,
  type PostType,
  type Upload,
  type WorldPost,
} from "~/types";

import EmojiPopover from "./EmojiPopover";
import ImageInput, { type ImageInputProps } from "./ImageInput";
import LazyPostEditor from "./LazyPostEditor";
import PostFormHiddenFromIdsPicker from "./PostFormHiddenFromIdsPicker";
import PostFormTextBlastCheckboxCard from "./PostFormTextBlastCheckboxCard";
import QuotedPostCard from "./QuotedPostCard";

import classes from "./PostForm.module.css";
import "@mantine/dates/styles.layer.css";

export type PostFormProps =
  | {
      post: WorldPost;
      onPostUpdated?: (post: WorldPost) => void;
    }
  | {
      newPostType: PostType | null;
      pausedFriendIds: string[];
      recentlyPausedFriendIds: string[];
      encouragement?: Encouragement;
      quotedPost?: Post;
      onPostCreated?: (post: WorldPost) => void;
    };

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

const PostForm: FC<PostFormProps> = props => {
  const newPostType = "newPostType" in props ? props.newPostType : undefined;
  const postType = "newPostType" in props ? props.newPostType : props.post.type;
  const post = "post" in props ? props.post : null;
  const encouragement = "encouragement" in props ? props.encouragement : null;
  const quotedPost =
    "quotedPost" in props ? props.quotedPost : (post?.quoted_post ?? undefined);
  const pausedFriendIds =
    "pausedFriendIds" in props ? props.pausedFriendIds : undefined;
  const recentlyPausedFriendIds =
    "recentlyPausedFriendIds" in props
      ? props.recentlyPausedFriendIds
      : undefined;

  const titlePlaceholder = postType
    ? POST_TITLE_PLACEHOLDERS[postType]
    : undefined;
  const bodyPlaceholder = postType
    ? POST_BODY_PLACEHOLDERS[postType]
    : undefined;

  // == Post editor
  const editorRef = useRef<Editor | null>();
  const [editorMounted, setEditorMounted] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  // == Draft values
  const [loadDraftValues, saveDraftValues, clearDraft] =
    usePostDraftValues(newPostType);

  // == Encouragement
  const [includedEncouragement, setIncludeEncouragement] =
    useState<boolean>(true);

  // == Form
  const initialValues = useMemo<PostFormValues>(() => {
    const {
      title,
      body_html,
      emoji,
      images,
      visibility,
      pinned_until,
      hidden_from_ids,
    } = post ?? {};
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
      text_blast: false,
      hidden_from_ids: hidden_from_ids ?? pausedFriendIds ?? [],
    };
  }, [post, pausedFriendIds]);
  const {
    setFieldValue,
    insertListItem,
    removeListItem,
    getInputProps,
    submit,
    values,
    submitting,
    reset,
    setValues,
    setInitialValues,
    setTouched,
    isDirty,
    isTouched,
    errors,
    getInitialValues,
  } = useForm<
    { post: WorldPost },
    PostFormValues,
    (values: PostFormValues) => { post: Record<string, any> }
  >({
    ...(post
      ? {
          action: routes.worldPosts.update,
          params: { id: post.id },
          descriptor: "update post",
          transformValues: ({
            emoji,
            title,
            images_uploads,
            pinned_until,
            text_blast,
            visibility,
            hidden_from_ids,
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
              text_blast: visibility === "only_me" ? false : text_blast,
              hidden_from_ids: visibility === "only_me" ? [] : hidden_from_ids,
            },
          }),
        }
      : {
          action: routes.worldPosts.create,
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
                encouragement_id:
                  encouragement && includedEncouragement
                    ? encouragement.id
                    : null,
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
    onValuesChange: (values, previous) => {
      if (isEqual(values, previous)) {
        return;
      }
      if (isTouched()) {
        saveDraftValues(values);
      }
    },
    onSuccess: ({ post }, { reset }) => {
      if (!("post" in props)) {
        reset();
        setShowImageInput(false);
        editorRef.current?.commands.clearContent();
        clearDraft();
      }
      void mutateWorldPosts();
      void mutateRoute(routes.worldPosts.pinned);
      void mutateRoute(routes.encouragements.index);
      if ("onPostCreated" in props) {
        props.onPostCreated?.(post);
      } else if ("onPostUpdated" in props) {
        props.onPostUpdated?.(post);
      }
    },
  });
  const resetFormAndEditor = useCallback(() => {
    reset();
    setEditorMounted(false);
    setEditorKey(prev => prev + 1);
    setShowImageInput(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const updateFromDraft = (): boolean => {
    const draftValues = loadDraftValues();
    if (!draftValues) {
      return false;
    }
    setValues(draftValues);
    setEditorMounted(false);
    setEditorKey(prev => prev + 1);
    setShowImageInput(!isEmpty(draftValues.images_uploads));
    return true;
  };
  useDidUpdate(() => {
    if (isEqual(initialValues, getInitialValues())) {
      return;
    }
    setInitialValues(initialValues);
    resetFormAndEditor();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    updateFromDraft();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useDidUpdate(() => {
    const updated = updateFromDraft();
    if (!updated) {
      resetFormAndEditor();
    }
  }, [postType]); // eslint-disable-line react-hooks/exhaustive-deps
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

  // == Image
  const [showImageInput, setShowImageInput] = useState(() =>
    post ? !isEmpty(post.images) : false,
  );
  const [newImageInputKey, setNewImageInputKey] = useState(0);

  // == Friends
  const { allFriends } = useWorldFriends({ keepPreviousData: true });

  return (
    <form onSubmit={submit}>
      <Stack>
        {encouragement && (
          <Transition transition="pop" mounted={includedEncouragement}>
            {transitionStyle => (
              <Stack gap={4} mx="md" style={transitionStyle}>
                <Card withBorder className={classes.encouragementCard}>
                  <Stack gap={2} style={{ alignSelf: "center" }}>
                    <Text size="sm">&ldquo;{encouragement.message}&rdquo;</Text>
                    <Text size="xs" c="dimmed" style={{ alignSelf: "end" }}>
                      — {prettyFriendName(encouragement.friend)}
                    </Text>
                  </Stack>
                </Card>
                <Text size="xs" c="dimmed" ta="center" mx="md" fs="italic">
                  message from{" "}
                  <Text span inherit fw={600}>
                    {encouragement.friend.name}
                  </Text>{" "}
                  will be attached.{" "}
                  <Anchor
                    component="button"
                    type="button"
                    size="xs"
                    fw={600}
                    onClick={() => {
                      setIncludeEncouragement(false);
                    }}
                  >
                    remove?
                  </Anchor>
                </Text>
              </Stack>
            )}
          </Transition>
        )}
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
                    <Box className={classes.emoji}>{values.emoji}</Box>
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
                  values.quiet
                    ? "don't send notifications"
                    : "send notifications"
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
                key={editorKey}
                initialValue={values.body_html}
                placeholder={bodyPlaceholder}
                onEditorCreated={editor => {
                  editorRef.current = editor;
                  setEditorMounted(true);
                  setBodyTextEmpty(editor.getText().trim() === "");
                }}
                onChange={value => {
                  setFieldValue("body_html", value);
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
                    offsetScrollbars="present"
                    className={classes.imagesScrollArea}
                    w={formStackWidth}
                  >
                    <Reorder.Group<Upload>
                      values={values.images_uploads}
                      axis="x"
                      layoutScroll={editorMounted}
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
                            setTouched(touchedFields => ({
                              ...touchedFields,
                              images_uploads: true,
                            }));
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
                          layoutScroll={editorMounted}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <ImageInput
                            key={newImageInputKey}
                            onChange={value => {
                              if (value) {
                                setTouched(touchedFields => ({
                                  ...touchedFields,
                                  images_uploads: true,
                                }));
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
            {!post && (
              <PostFormTextBlastCheckboxCard
                {...getInputProps("text_blast", { type: "checkbox" })}
                disabled={values.quiet || values.visibility === "only_me"}
              />
            )}
            <Group justify="end" mt="xs">
              <Transition
                transition="fade"
                mounted={
                  !isEmpty(allFriends) && values.visibility !== "only_me"
                }
              >
                {transitionStyle => (
                  <PostFormHiddenFromIdsPicker
                    {...{ recentlyPausedFriendIds }}
                    {...getInputProps("hidden_from_ids")}
                  >
                    <Anchor
                      component="button"
                      type="button"
                      size="xs"
                      underline="always"
                      c="dimmed"
                      style={transitionStyle}
                    >
                      {isEmpty(values.hidden_from_ids) ? (
                        "visible to all friends"
                      ) : (
                        <>
                          hidden from {values.hidden_from_ids.length}{" "}
                          {inflect("friend", values.hidden_from_ids.length)}
                        </>
                      )}
                    </Anchor>
                  </PostFormHiddenFromIdsPicker>
                )}
              </Transition>
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
      </Stack>
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
