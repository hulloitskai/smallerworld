import { Input, Popover, ScrollArea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { type Initialize } from "@mantine/form";
import { useLongPress, useViewportSize } from "@mantine/hooks";
import { type Editor } from "@tiptap/react";
import { map } from "lodash-es";
import { type DraggableProps, motion, Reorder } from "motion/react";
import { type RefObject } from "react";

import CalendarIcon from "~icons/heroicons/calendar-20-solid";
import LinkIcon from "~icons/heroicons/link-20-solid";
import ImageIcon from "~icons/heroicons/photo-20-solid";
import ProfileIcon from "~icons/heroicons/user-circle-20-solid";
import SpotifyIcon from "~icons/ri/spotify-fill";

import { isAndroid, isIos, useBrowserDetection } from "~/helpers/browsers";
import {
  POST_BODY_PLACEHOLDERS,
  POST_TITLE_PLACEHOLDERS,
  postTypeHasTitle,
  spacePostDraftKey,
} from "~/helpers/posts";
import { usePostDraftFormValues } from "~/helpers/posts/drafts";
import { htmlHasText } from "~/helpers/richText";
import { mutateSpacePosts } from "~/helpers/spaces";
import {
  parseSpotifyTrackId,
  validateSpotifyTrackUrl,
} from "~/helpers/spotify";
import { currentTimeZone } from "~/helpers/time";
import { type Post, type PostType, type Upload } from "~/types";

import EmojiPopover from "./EmojiPopover";
import ImageInput, { type ImageInputProps } from "./ImageInput";
import LazyPostEditor from "./LazyPostEditor";
import LoginForm from "./LoginForm";

import classes from "./SpacePostForm.module.css";
import "@mantine/dates/styles.layer.css";

export type SpacePostFormProps = { spaceId: string } & (
  | {
      post: Post;
      onPostUpdated?: (post: Post) => void;
    }
  | {
      newPostType: PostType;
      onPostCreated?: (post: Post) => void;
    }
);

interface SpacePostFormValues {
  title: string;
  body_html: string;
  emoji: string;
  images_uploads: Upload[];
  pinned_until: string | null;
  spotify_track_url: string;
}

interface SpacePostFormSubmission {
  post: {
    emoji: string | null;
    title: string | null;
    body_html: string;
    images: string[];
    pinned_until: string | null;
    spotify_track_id: string | null;
    quoted_post_id?: string | null;
  };
}

const IMAGE_INPUT_SIZE = 140;

const SpacePostForm: FC<SpacePostFormProps> = props => {
  const { spaceId } = props;
  const newPostType = "newPostType" in props ? props.newPostType : undefined;
  const postType = "newPostType" in props ? props.newPostType : props.post.type;
  const post = "post" in props ? props.post : null;

  const currentUser = useCurrentUser();

  const showTitleInput = useMemo(
    () => !!postType && postTypeHasTitle(postType),
    [postType],
  );
  const titlePlaceholder = postType
    ? POST_TITLE_PLACEHOLDERS[postType]
    : undefined;
  const bodyPlaceholder = postType
    ? POST_BODY_PLACEHOLDERS[postType]
    : undefined;

  // == Editor
  const editorRef = useRef<Editor | null>();
  const [editorMounted, setEditorMounted] = useState(false);
  const updateEditor = useCallback((content: string): void => {
    const editor = editorRef.current;
    if (editor) {
      editor.commands.setContent(content);
    }
  }, []);

  // == Viewport height
  const { height: viewportHeight } = useViewportSize();
  const browserDetection = useBrowserDetection();

  // == Draft values
  const [draftValues, saveDraftValues, clearDraft] =
    usePostDraftFormValues<SpacePostFormValues>({
      postType: newPostType,
      localStorageKey: spacePostDraftKey(spaceId),
    });

  // == Form
  const initialValues = useMemo<SpacePostFormValues>(() => {
    const { title, body_html, emoji, images, pinned_until, spotify_track_id } =
      post ?? {};
    const visibility = post?.visibility ?? "friends";
    return {
      title: title ?? "",
      body_html: body_html ?? "",
      emoji: emoji ?? "",
      images_uploads: images
        ? images.map<Upload>(image => ({ signedId: image.signed_id }))
        : [],
      visibility,
      pinned_until: pinned_until ?? "",
      spotify_track_url: spotify_track_id
        ? `https://open.spotify.com/track/${spotify_track_id}`
        : "",
    };
  }, [post]);
  const reinitializeFormAndEditor = useCallback(
    (
      initialize: Initialize<SpacePostFormValues>,
      initialValues: SpacePostFormValues,
    ) => {
      shouldRestoreDraftRef.current = false;
      initialize(initialValues);
      updateEditor(initialValues.body_html);
    },
    [updateEditor],
  );
  const {
    setFieldValue,
    insertListItem,
    removeListItem,
    getInputProps,
    submit,
    values,
    submitting,
    setValues,
    setTouched,
    isDirty,
    initialize,
    isTouched,
    errors,
    getInitialValues,
    isValid,
    watch,
  } = useForm<
    { post: Post },
    SpacePostFormValues,
    (values: SpacePostFormValues) => SpacePostFormSubmission
  >({
    ...(post
      ? {
          action: routes.spacePosts.update,
          params: { id: post.id },
          descriptor: "update post",
          transformValues: ({
            emoji,
            title,
            images_uploads,
            pinned_until,
            spotify_track_url,
            ...values
          }) => ({
            post: {
              ...values,
              emoji: emoji || null,
              title: title || null,
              images: map(images_uploads, "signedId"),
              pinned_until: pinned_until
                ? formatPinnedUntil(pinned_until)
                : null,
              spotify_track_id: spotify_track_url
                ? parseSpotifyTrackId(spotify_track_url)
                : null,
            },
          }),
        }
      : {
          action: routes.spacePosts.create,
          params: { space_id: spaceId },
          descriptor: "create post",
          transformValues: ({
            emoji,
            title,
            images_uploads,
            pinned_until,
            spotify_track_url,
            ...values
          }) => ({
            post: {
              ...values,
              type: postType,
              emoji: emoji || null,
              title: showTitleInput ? title || null : null,
              spotify_track_url: spotify_track_url || null,
              images: map(images_uploads, "signedId"),
              pinned_until: pinned_until
                ? formatPinnedUntil(pinned_until)
                : null,
              spotify_track_id: spotify_track_url
                ? parseSpotifyTrackId(spotify_track_url)
                : null,
            },
          }),
        }),
    transformErrors: ({ image, spotify_track_id, ...errors }) => ({
      ...errors,
      image_upload: image,
      spotify_track_url: spotify_track_id,
    }),
    initialValues,
    validate: {
      spotify_track_url: validateSpotifyTrackUrl,
    },
    onValuesChange: (values, previous) => {
      if (isEqual(values, previous)) {
        return;
      }
      if (isTouched()) {
        shouldRestoreDraftRef.current = false;
        saveDraftValues(values);
      }
    },
    onSuccess: ({ post }, { initialize, getInitialValues }) => {
      if (!("post" in props)) {
        reinitializeFormAndEditor(initialize, getInitialValues());
        clearDraft();
      }
      if ("onPostCreated" in props) {
        props.onPostCreated?.(post);
      } else if ("onPostUpdated" in props) {
        props.onPostUpdated?.(post);
      }
      void mutateSpacePosts(spaceId);
    },
  });
  watch("images_uploads", ({ value }) => {
    if (!showImageInput && !isEmpty(value)) {
      setShowImageInput(true);
    }
  });
  watch("spotify_track_url", ({ value }) => {
    setShowSpotifyInput(!!value);
  });
  useDidUpdate(() => {
    if (isEqual(initialValues, getInitialValues())) {
      return;
    }
    reinitializeFormAndEditor(initialize, initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  // == Draft restoration
  const shouldRestoreDraftRef = useRef(true);
  const restoreDraftOnce = useCallback(() => {
    if (!post && draftValues && shouldRestoreDraftRef.current) {
      setValues(draftValues);
      shouldRestoreDraftRef.current = false;
      return draftValues;
    }
  }, [post, draftValues, setValues]);
  useDidUpdate(() => {
    const draftValues = restoreDraftOnce();
    if (draftValues) {
      updateEditor(draftValues.body_html);
    }
  }, [restoreDraftOnce, updateEditor]);

  // == Pinned until
  const vaulPortalTarget = useVaulPortalTarget();
  const todayDate = useMemo(() => DateTime.now().toJSDate(), []);

  // == Attachments
  const [showSpotifyInput, setShowSpotifyInput] = useState(
    !!post?.spotify_track_id,
  );
  const [showImageInput, setShowImageInput] = useState(() =>
    post ? !isEmpty(post.images) : false,
  );
  const [newImageInputKey, setNewImageInputKey] = useState(0);
  const allAttachmentsShown = showSpotifyInput && showImageInput;

  // == Form stack
  const { ref: formStackRef, width: formStackWidth } =
    useElementSize<HTMLDivElement>();

  // == Login popover
  // const [loginPopoverOpened, setLoginPopoverOpened] = useState(false);

  // == Emoji input
  const emojiInput = (
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
            <Box component={EmojiIcon} c="var(--mantine-color-placeholder)" />
          )}
        </ActionIcon>
      )}
    </EmojiPopover>
  );

  return (
    <form onSubmit={submit}>
      <Stack>
        <Group gap={6} align="start" justify="center">
          {!showTitleInput && emojiInput}
          <Stack
            ref={formStackRef as RefObject<HTMLDivElement>}
            gap="xs"
            style={{ flexGrow: 1 }}
          >
            {showTitleInput && (
              <Group gap={6}>
                {emojiInput}
                <TextInput
                  {...getInputProps("title")}
                  {...(!!titlePlaceholder && {
                    placeholder: `(optional) ${titlePlaceholder}`,
                  })}
                  styles={{
                    root: {
                      flexGrow: 1,
                    },
                    input: {
                      fontFamily: "var(--mantine-font-family-headings)",
                    },
                  }}
                />
              </Group>
            )}
            <Input.Wrapper error={errors.body_html}>
              <LazyPostEditor
                initialValue={values.body_html}
                placeholder={bodyPlaceholder}
                contentProps={{
                  className: classes.postEditorContent,
                  ...(browserDetection &&
                    (isIos(browserDetection) ||
                      isAndroid(browserDetection)) && {
                      mah: viewportHeight * 0.4,
                    }),
                }}
                onEditorCreated={editor => {
                  editorRef.current = editor;
                  setEditorMounted(true);
                }}
                onChange={value => {
                  startTransition(() => {
                    setFieldValue("body_html", value);
                  });
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
                  arrowOffset: 20,
                  portalProps: {
                    target: vaulPortalTarget,
                  },
                }}
              />
            )}
            {!allAttachmentsShown && (
              <Group justify="center" gap="xs">
                {!showImageInput && (
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
                {!showSpotifyInput && (
                  <Button
                    size="compact-sm"
                    style={{ alignSelf: "center" }}
                    leftSection={<SpotifyIcon />}
                    onClick={() => {
                      setShowSpotifyInput(true);
                    }}
                  >
                    add a spotify song
                  </Button>
                )}
              </Group>
            )}
            {showSpotifyInput && (
              <TextInput
                {...getInputProps("spotify_track_url")}
                leftSection={<LinkIcon />}
                placeholder="https://open.spotify.com/track/..."
                autoComplete="off"
                inputContainer={children => (
                  <Group
                    gap="xs"
                    className={classes.spotifyTrackInputContainer}
                  >
                    {children}
                    <Button
                      leftSection={<RemoveIcon />}
                      variant="subtle"
                      color="red"
                      size="compact-sm"
                      className={classes.removeSpotifyTrackButton}
                      onClick={() => {
                        setShowSpotifyInput(false);
                        setFieldValue("spotify_track_url", "");
                      }}
                    >
                      remove
                    </Button>
                  </Group>
                )}
              />
            )}
            {(showImageInput || !isEmpty(values.images_uploads)) && (
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
            )}
          </Stack>
        </Group>
        <Popover
          width={375}
          disabled={!!currentUser}
          closeOnClickOutside={false}
          trapFocus
        >
          <Popover.Target>
            <Button
              type={currentUser ? "submit" : "button"}
              variant="filled"
              size="lg"
              leftSection={post ? <SaveIcon /> : <SendIcon />}
              disabled={
                !isDirty() || !isValid() || !htmlHasText(values.body_html)
              }
              loading={submitting}
            >
              {post ? "save" : "post"}
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <LoginOrRegisterForm
              onRegisteredAndSignedIn={() => {
                submit();
              }}
            />
          </Popover.Dropdown>
        </Popover>
      </Stack>
    </form>
  );
};

export default SpacePostForm;

const formatPinnedUntil = (dateString: string): string =>
  DateTime.fromISO(dateString, { zone: "local" })
    .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
    .toISO();

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

interface LoginOrRegisterFormProps {
  onRegisteredAndSignedIn: () => void;
}

const LoginOrRegisterForm: FC<LoginOrRegisterFormProps> = ({
  onRegisteredAndSignedIn,
}) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const reloadCurrentUserAndContinue = () => {
    router.reload({
      only: ["currentUser"],
      onSuccess: () => {
        onRegisteredAndSignedIn();
      },
    });
  };
  return (
    <>
      {showRegistrationForm ? (
        <RegistrationForm
          onRegistrationCreated={reloadCurrentUserAndContinue}
        />
      ) : (
        <LoginForm
          onSessionCreated={registered => {
            if (!registered) {
              setShowRegistrationForm(true);
            } else {
              reloadCurrentUserAndContinue();
            }
          }}
        />
      )}
    </>
  );
};

interface RegistrationFormProps {
  onRegistrationCreated: () => void;
}

const RegistrationForm: FC<RegistrationFormProps> = ({
  onRegistrationCreated,
}) => {
  const { getInputProps, submit } = useForm({
    action: routes.registrations.create,
    descriptor: "complete signup",
    initialValues: {
      name: "",
    },
    transformValues: ({ name }) => ({
      user: {
        name,
        time_zone: currentTimeZone(),
      },
    }),
    onSuccess: () => {
      onRegistrationCreated();
    },
  });
  return (
    <form onSubmit={submit}>
      <Stack gap="xs">
        <TextInput {...getInputProps("name")} label="your name" required />
        <Button type="submit" variant="filled" leftSection={<ProfileIcon />}>
          complete signup and post
        </Button>
      </Stack>
    </form>
  );
};
