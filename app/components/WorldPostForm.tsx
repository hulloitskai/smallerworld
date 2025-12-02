import {
  Accordion,
  Input,
  ScrollArea,
  SegmentedControl,
  Table,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { type Initialize } from "@mantine/form";
import { useLongPress, useMergedRef, useViewportSize } from "@mantine/hooks";
import { type Editor } from "@tiptap/react";
import { difference, invertBy, map, sortBy, uniq } from "lodash-es";
import { type DraggableProps, motion, Reorder } from "motion/react";
import { type PropsWithChildren } from "react";

import MutedIcon from "~icons/heroicons/bell-slash-20-solid";
import CalendarIcon from "~icons/heroicons/calendar-20-solid";
import VisibleIcon from "~icons/heroicons/eye-20-solid";
import HiddenIcon from "~icons/heroicons/eye-slash-20-solid";
import LinkIcon from "~icons/heroicons/link-20-solid";
import ImageIcon from "~icons/heroicons/photo-20-solid";
import SpotifyIcon from "~icons/ri/spotify-fill";

import { isAndroid, isIos, useBrowserDetection } from "~/helpers/browsers";
import { prettyFriendName } from "~/helpers/friends";
import {
  NONPRIVATE_POST_VISIBILITIES,
  POST_BODY_PLACEHOLDERS,
  POST_TITLE_PLACEHOLDERS,
  POST_VISIBILITIES,
  POST_VISIBILITY_DESCRIPTORS,
  POST_VISIBILITY_TO_ICON,
  POST_VISIBILITY_TO_LABEL,
  postTypeHasTitle,
  worldPostDraftKey,
} from "~/helpers/posts";
import { usePostDraftFormValues } from "~/helpers/posts/drafts";
import { htmlHasText } from "~/helpers/richText";
import {
  parseSpotifyTrackId,
  validateSpotifyTrackUrl,
} from "~/helpers/spotify";
import { mutateUserUniversePosts } from "~/helpers/userUniverse";
import { mutateUserWorldPosts, useUserWorldFriends } from "~/helpers/userWorld";
import { mutateWorldTimeline } from "~/helpers/worlds";
import {
  type Encouragement,
  type Post,
  type PostType,
  type PostVisibility,
  type QuotedPost,
  type Upload,
  type UserWorldFriendProfile,
} from "~/types";

import EmojiPopover from "./EmojiPopover";
import ImageInput, { type ImageInputProps } from "./ImageInput";
import LazyPostEditor from "./LazyPostEditor";
import QuotedPostCard from "./QuotedPostCard";

import classes from "./WorldPostForm.module.css";
import "@mantine/dates/styles.css";

export type WorldPostFormProps = { worldId: string } & (
  | {
      post: Post;
      onPostUpdated?: (post: Post) => void;
    }
  | {
      worldId: string;
      newPostType: PostType;
      encouragementId?: string;
      quotedPost?: Post;
      onPostCreated?: (post: Post) => void;
    }
);

interface WorldPostFormValues {
  title: string;
  body_html: string;
  emoji: string;
  images_uploads: Upload[];
  visibility: PostVisibility;
  pinned_until: string | null;
  friend_notifiability: Record<string, "hidden" | "muted" | "notify">;
  encouragement_id: string | null;
  spotify_track_url: string;
}

interface WorldPostFormSubmission {
  post: {
    emoji: string | null;
    title: string | null;
    body_html: string;
    images: string[];
    visibility: PostVisibility;
    pinned_until: string | null;
    hidden_from_ids: string[];
    visible_to_ids: string[];
    friend_ids_to_notify: string[];
    encouragement_id: string | null;
    spotify_track_id: string | null;
    quoted_post_id?: string | null;
  };
}

const IMAGE_INPUT_SIZE = 140;

const WorldPostForm: FC<WorldPostFormProps> = props => {
  const { worldId } = props;
  let newPostType: PostType | undefined,
    postType: PostType,
    encouragementId: string | undefined,
    post: Post | null | undefined,
    quotedPost: QuotedPost | null | undefined;
  if ("post" in props) {
    post = props.post;
    postType = post.type;
    encouragementId = post.encouragement?.id;
    quotedPost = post.quoted_post;
  } else {
    newPostType = props.newPostType;
    postType = newPostType;
  }

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

  // == Load encouragement
  const { data: encouragementData } = useRouteSWR<{
    encouragement: Encouragement;
  }>(routes.userWorldEncouragements.show, {
    params: encouragementId ? { id: encouragementId } : null,
    descriptor: "load encouragement",
  });
  const { encouragement } = encouragementData ?? {};

  // == Load world friends
  const { friends } = useUserWorldFriends();
  const subscribedFriends = useMemo(
    () =>
      friends?.filter(
        friend =>
          friend.notifiable && friend.subscribed_post_types.includes(postType),
      ),
    [friends, postType],
  );

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
    usePostDraftFormValues<WorldPostFormValues>({
      postType: newPostType,
      localStorageKey: worldPostDraftKey(worldId),
    });

  // == Post audience
  const { data: audienceData } = useRouteSWR<{
    hiddenFromIds: string[];
    notifiedIds: string[];
    visibleToIds: string[];
  }>(routes.userWorldPosts.audience, {
    params: post ? { id: post.id } : null,
    descriptor: "load post audience",
  });

  // == Form
  const initialValues = useMemo<WorldPostFormValues>(() => {
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
      friend_notifiability: subscribedFriends
        ? buildFriendNotifiability(subscribedFriends, visibility, audienceData)
        : {},
      encouragement_id: encouragement?.id ?? post?.encouragement?.id ?? null,
      spotify_track_url: spotify_track_id
        ? `https://open.spotify.com/track/${spotify_track_id}`
        : "",
    };
  }, [post, encouragement, subscribedFriends, audienceData]);
  const reinitializeFormAndEditor = useCallback(
    (
      initialize: Initialize<WorldPostFormValues>,
      initialValues: WorldPostFormValues,
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
    isValid,
    initialize,
    isTouched,
    errors,
    getInitialValues,
    watch,
  } = useForm<
    { post: Post },
    WorldPostFormValues,
    (values: WorldPostFormValues) => WorldPostFormSubmission
  >({
    ...(post
      ? {
          action: routes.userWorldPosts.update,
          params: { id: post.id },
          descriptor: "update post",
          transformValues: ({
            emoji,
            title,
            images_uploads,
            pinned_until,
            visibility,
            friend_notifiability,
            spotify_track_url,
            ...values
          }) => {
            invariant(audienceData, "Missing audience data");
            const { notifiedIds } = audienceData;
            const {
              hidden: hiddenFromIds = [],
              muted: mutedIds = [],
              notify: friendIdsToNotify = [],
            } = invertBy(friend_notifiability);
            const visibleToIds = uniq(mutedIds.concat(friendIdsToNotify));
            const submission = {
              post: {
                ...values,
                emoji: emoji || null,
                title: title || null,
                images: map(images_uploads, "signedId"),
                pinned_until: pinned_until
                  ? formatPinnedUntil(pinned_until)
                  : null,
                visibility,
                spotify_track_id: spotify_track_url
                  ? parseSpotifyTrackId(spotify_track_url)
                  : null,
                friend_ids_to_notify: difference(
                  friendIdsToNotify,
                  notifiedIds,
                ),
                ...(visibility === "secret"
                  ? {
                      hidden_from_ids: [],
                      visible_to_ids: visibleToIds,
                    }
                  : {
                      hidden_from_ids: hiddenFromIds,
                      visible_to_ids: [],
                    }),
              },
            };
            return submission;
          },
        }
      : {
          action: routes.userWorldPosts.create,
          descriptor: "create post",
          transformValues: ({
            emoji,
            title,
            images_uploads,
            pinned_until,
            visibility,
            encouragement_id,
            friend_notifiability,
            spotify_track_url,
            ...values
          }) => {
            const {
              hidden: hiddenFromIds = [],
              muted: mutedIds = [],
              notify: friendIdsToNotify = [],
            } = invertBy(friend_notifiability);
            const visibleToIds = uniq(mutedIds.concat(friendIdsToNotify));
            return {
              post: {
                ...values,
                type: postType,
                emoji: emoji || null,
                title: showTitleInput ? title || null : null,
                spotify_track_url: spotify_track_url || null,
                images: map(images_uploads, "signedId"),
                quoted_post_id: quotedPost?.id ?? null,
                pinned_until: pinned_until
                  ? formatPinnedUntil(pinned_until)
                  : null,
                spotify_track_id: spotify_track_url
                  ? parseSpotifyTrackId(spotify_track_url)
                  : null,
                visibility,
                encouragement_id,
                friend_ids_to_notify: friendIdsToNotify,
                ...(visibility === "secret"
                  ? {
                      hidden_from_ids: [],
                      visible_to_ids: visibleToIds,
                    }
                  : {
                      hidden_from_ids: hiddenFromIds,
                      visible_to_ids: [],
                    }),
              },
            };
          },
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
      if ("post" in props) {
        void mutateRoute(routes.userWorldPosts.audience, { id: post.id });
      } else {
        reinitializeFormAndEditor(initialize, getInitialValues());
        clearDraft();
        void mutateRoute(routes.userWorldEncouragements.index);
      }
      void mutateWorldTimeline(worldId);
      void mutateUserWorldPosts();
      void mutateUserUniversePosts();
      void mutateRoute(routes.userWorldPosts.pinned);
      if ("onPostCreated" in props) {
        props.onPostCreated?.(post);
      } else if ("onPostUpdated" in props) {
        props.onPostUpdated?.(post);
      }
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

  // == Update friend notifiability when visibility changes
  watch("visibility", ({ value, previousValue }) => {
    if (
      NONPRIVATE_POST_VISIBILITIES.includes(value) &&
      NONPRIVATE_POST_VISIBILITIES.includes(previousValue ?? "")
    ) {
      return;
    }
    if (!subscribedFriends) {
      return;
    }
    setFieldValue(
      "friend_notifiability",
      buildFriendNotifiability(subscribedFriends, value, audienceData),
    );
  });

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

  // == Friend notifiability
  const [currentlyNotifyingNone, currentlyMutingNone] = useMemo(() => {
    const friendsById = keyBy(subscribedFriends, "id");
    let notifyingNone = true;
    let mutingNone = true;
    for (const [friendId, notifiability] of Object.entries(
      values.friend_notifiability,
    )) {
      if (notifiability === "notify") {
        notifyingNone = false;
      } else if (notifiability === "muted") {
        const friend = friendsById[friendId];
        if (friend?.notifiable === "push") {
          mutingNone = false;
        }
      }
    }
    return [notifyingNone, mutingNone];
  }, [values, subscribedFriends]);

  const { ref: formStackSizingRef, width: formStackWidth } =
    useElementSize<HTMLDivElement>();
  const formStackRef = useMergedRef(formStackSizingRef);
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
        {encouragement && (
          <Transition mounted={!!values.encouragement_id}>
            {transitionStyle => (
              <Stack gap={4} style={transitionStyle}>
                <Card withBorder className={classes.encouragementCard}>
                  <Stack gap={2} style={{ alignSelf: "center" }}>
                    <Text size="sm">
                      <span className={classes.encouragementEmoji}>
                        {encouragement.emoji}
                      </span>{" "}
                      &ldquo;{encouragement.message}&rdquo;
                    </Text>
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
                  {post ? "is" : "will be"} attached.{" "}
                  <Anchor
                    component="button"
                    type="button"
                    size="xs"
                    fw={600}
                    onClick={() => {
                      setFieldValue("encouragement_id", null);
                    }}
                  >
                    remove?
                  </Anchor>
                </Text>
              </Stack>
            )}
          </Transition>
        )}
        <Group gap={6} align="start" justify="center">
          {!showTitleInput && emojiInput}
          <Stack ref={formStackRef} gap="xs" style={{ flexGrow: 1 }}>
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
            {quotedPost && <QuotedPostCard post={quotedPost} />}
            {!quotedPost && !allAttachmentsShown && (
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
        <Card withBorder className={classes.visibilityCard}>
          <Stack gap="xs">
            <Stack gap={4}>
              <SegmentedControl
                {...getInputProps("visibility")}
                data={POST_VISIBILITIES.map(visibility => ({
                  label: (
                    <Group gap={6} justify="center">
                      <Box
                        component={POST_VISIBILITY_TO_ICON[visibility]}
                        fz="xs"
                      />
                      {POST_VISIBILITY_TO_LABEL[visibility]}
                    </Group>
                  ),
                  value: visibility,
                }))}
                className={classes.segmentedControl}
              />
              <Text size="xs" c="dimmed" ta="center" inline>
                {POST_VISIBILITY_DESCRIPTORS[values.visibility]}
              </Text>
            </Stack>
            <Transition transition="pop" mounted={!isEmpty(subscribedFriends)}>
              {transitionStyle => (
                <Accordion
                  variant="filled"
                  className={classes.friendNotifiabilityAccordion}
                  style={transitionStyle}
                >
                  <Accordion.Item value="friend_notifiability">
                    <Accordion.Control icon={<SettingsIcon />}>
                      choose specific friends
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap={4}>
                        <Transition mounted={values.visibility !== "secret"}>
                          {transitionStyle => (
                            <Group
                              gap={8}
                              justify="center"
                              style={transitionStyle}
                            >
                              <Button
                                size="compact-xs"
                                leftSection={<MutedIcon />}
                                disabled={currentlyNotifyingNone}
                                className={
                                  classes.friendNotifiabilityPresetButton
                                }
                                onClick={() => {
                                  setFieldValue(
                                    "friend_notifiability",
                                    prevValue =>
                                      mapValues(prevValue, prevNotifiability =>
                                        prevNotifiability === "notify"
                                          ? "muted"
                                          : prevNotifiability,
                                      ),
                                  );
                                }}
                              >
                                mute notifications
                              </Button>
                              <Button
                                size="compact-xs"
                                leftSection={<NotificationIcon />}
                                disabled={currentlyMutingNone}
                                className={
                                  classes.friendNotifiabilityPresetButton
                                }
                                onClick={() => {
                                  const friendsById = keyBy(
                                    subscribedFriends,
                                    "id",
                                  );
                                  setFieldValue(
                                    "friend_notifiability",
                                    prevValue =>
                                      mapValues(
                                        prevValue,
                                        (prevNotifiability, friendId) => {
                                          const friend = friendsById[friendId];
                                          if (!friend) {
                                            return prevNotifiability;
                                          }
                                          if (
                                            prevNotifiability !== "muted" ||
                                            friend.notifiable !== "push"
                                          ) {
                                            return prevNotifiability;
                                          }
                                          return "notify";
                                        },
                                      ),
                                  );
                                }}
                              >
                                notify all
                              </Button>
                            </Group>
                          )}
                        </Transition>
                        {subscribedFriends && (
                          <FriendNotifiabilityTables
                            postId={post?.id}
                            friends={subscribedFriends}
                            visibility={values.visibility}
                            getSegmentedControlInputProps={friend =>
                              getInputProps(`friend_notifiability.${friend.id}`)
                            }
                          />
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              )}
            </Transition>
          </Stack>
          <Center pos="absolute" left={0} right={0} top={-10}>
            <Badge variant="default" className={classes.visibilityBadge}>
              who can see this post?
            </Badge>
          </Center>
        </Card>
        <Button
          type="submit"
          variant="filled"
          size="lg"
          leftSection={post ? <SaveIcon /> : <SendIcon />}
          disabled={
            !isDirty() ||
            !isValid() ||
            !htmlHasText(values.body_html) ||
            (!!post && !audienceData)
          }
          loading={submitting}
        >
          {post ? "save" : "post"}
        </Button>
      </Stack>
    </form>
  );
};

export default WorldPostForm;

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

const buildFriendNotifiability = (
  friends: UserWorldFriendProfile[],
  visibility: PostVisibility,
  audienceData:
    | {
        hiddenFromIds: string[];
        notifiedIds: string[];
        visibleToIds: string[];
      }
    | undefined,
): Record<string, "hidden" | "muted" | "notify"> =>
  mapValues(keyBy(friends, "id"), friend =>
    audienceData
      ? audienceData.notifiedIds.includes(friend.id)
        ? "notify"
        : visibility === "secret"
          ? audienceData.visibleToIds.includes(friend.id)
            ? "muted"
            : "hidden"
          : audienceData.hiddenFromIds.includes(friend.id)
            ? "hidden"
            : "muted"
      : visibility === "secret"
        ? "hidden"
        : friend.paused_since
          ? "hidden"
          : friend.notifiable === "push"
            ? "notify"
            : "muted",
  );

interface FriendNotifiabilityTableProps {
  postId: string | undefined;
  friends: UserWorldFriendProfile[];
  visibility: PostVisibility;
  getSegmentedControlInputProps: (friend: UserWorldFriendProfile) => {
    value?: any;
    onChange: any;
  };
}

const FriendNotifiabilityTables: FC<FriendNotifiabilityTableProps> = ({
  postId,
  friends,
  visibility,
  getSegmentedControlInputProps,
}) => {
  // == Post audience
  const { data: audienceData } = useRouteSWR<{
    hiddenFromIds: string[];
    notifiedIds: string[];
    visibleToIds: string[];
  }>(routes.userWorldPosts.audience, {
    params: postId ? { id: postId } : null,
    descriptor: "load post audience",
  });
  const { pausedFriends, textOnlyFriends, pushableFriends } = useMemo(() => {
    const pausedFriends = [];
    const textOnlyFriends = [];
    const pushableFriends = [];
    for (const friend of friends) {
      if (friend.paused_since) {
        pausedFriends.push(friend);
      } else if (friend.notifiable === "sms") {
        textOnlyFriends.push(friend);
      } else {
        pushableFriends.push(friend);
      }
    }
    const sortFriends = (friends: UserWorldFriendProfile[]) =>
      sortBy(friends, "name");
    return {
      pausedFriends: sortFriends(pausedFriends),
      textOnlyFriends: sortFriends(textOnlyFriends),
      pushableFriends: sortFriends(pushableFriends),
    };
  }, [friends]);

  const renderRow = (friend: UserWorldFriendProfile) => {
    const { value, ...inputProps } = getSegmentedControlInputProps(friend);
    const notified = audienceData?.notifiedIds?.includes(friend.id);
    return (
      <Table.Tr key={friend.id}>
        <Table.Td
          className={classes.friendNotifiabilityTableNameCell}
          data-notifiability={value}
        >
          <Group gap={6}>
            {!!friend.emoji && (
              <Text span inherit ff="var(--font-family-emoji)" fz="xs">
                {friend.emoji}
              </Text>
            )}
            <Text span inherit>
              {friend.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td w={1} pos="relative">
          <SegmentedControl
            {...{ value }}
            {...inputProps}
            withItemsBorders
            data={[
              {
                value: "hidden",
                label: (
                  <Tooltip label="hide post" withArrow>
                    <HiddenIcon />
                  </Tooltip>
                ),
              },
              ...(notified
                ? []
                : [
                    {
                      value: "muted",
                      label: (
                        <Tooltip label="show, don't notify" withArrow>
                          {visibility === "secret" ? (
                            <VisibleIcon />
                          ) : (
                            <MutedIcon />
                          )}
                        </Tooltip>
                      ),
                    },
                  ]),
              {
                value: "notify",
                label:
                  friend.notifiable === "sms" ? (
                    <Tooltip
                      label={
                        notified
                          ? "text notification sent"
                          : "send text notification"
                      }
                    >
                      <Group gap={0}>
                        <PhoneIcon />
                        {notified && <SuccessIcon />}
                      </Group>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      label={
                        notified
                          ? "push notification sent"
                          : "send push notification"
                      }
                    >
                      <Group gap={0}>
                        <NotificationIcon />
                        {notified && <SuccessIcon />}
                      </Group>
                    </Tooltip>
                  ),
              },
            ]}
            {...(value === "notify" && {
              color: "primary",
            })}
            className={cn(
              classes.segmentedControl,
              classes.friendNotifiabilitySegmentedControl,
            )}
          />
          <LoadingOverlay
            visible={!!postId && !audienceData}
            overlayProps={{ backgroundOpacity: 0 }}
          />
        </Table.Td>
      </Table.Tr>
    );
  };
  return (
    <Stack gap={4}>
      {!isEmpty(pushableFriends) && (
        <ScrollableTableContainer>
          <Table stickyHeader className={classes.friendNotifiabilityTable}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th colSpan={2}>
                  friends that installed your world
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{pushableFriends.map(renderRow)}</Table.Tbody>
          </Table>
        </ScrollableTableContainer>
      )}
      {!isEmpty(textOnlyFriends) && (
        <ScrollableTableContainer>
          <Table stickyHeader className={classes.friendNotifiabilityTable}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th colSpan={2}>friends subscribed via text</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{textOnlyFriends.map(renderRow)}</Table.Tbody>
          </Table>
        </ScrollableTableContainer>
      )}
      {!isEmpty(pausedFriends) && (
        <ScrollableTableContainer>
          <Table stickyHeader className={classes.friendNotifiabilityTable}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th colSpan={2}>paused friends</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{pausedFriends.map(renderRow)}</Table.Tbody>
          </Table>
        </ScrollableTableContainer>
      )}
    </Stack>
  );
};

const ScrollableTableContainer: FC<PropsWithChildren> = ({ children }) => (
  <ScrollArea.Autosize type="auto" mah={200}>
    {children}
  </ScrollArea.Autosize>
);
