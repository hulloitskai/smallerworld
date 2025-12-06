import { Input, ScrollArea, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useLongPress, useMergedRef, useViewportSize } from "@mantine/hooks";
import { type Editor } from "@tiptap/react";
import { DateTime } from "luxon";
import { type DraggableProps, motion, Reorder } from "motion/react";

import CalendarIcon from "~icons/heroicons/calendar-20-solid";
import LinkIcon from "~icons/heroicons/link-20-solid";
import ImageIcon from "~icons/heroicons/photo-20-solid";
import SpotifyIcon from "~icons/ri/spotify-fill";

import { isAndroid, isIos, useBrowserDetection } from "~/helpers/browsers";
import { type FormHelper } from "~/helpers/form";
import {
  POST_BODY_PLACEHOLDERS,
  POST_TITLE_PLACEHOLDERS,
  postTypeHasTitle,
} from "~/helpers/posts";
import {
  type Post,
  type PostPrompt,
  type PostType,
  type Upload,
} from "~/types";

import EmojiPopover from "./EmojiPopover";
import ImageInput, { type ImageInputProps } from "./ImageInput";
import LazyPostEditor from "./LazyPostEditor";

import classes from "./SpacePostFormBody.module.css";
import "@mantine/dates/styles.css";

export interface SpacePostFormValues {
  title: string;
  body_html: string;
  emoji: string;
  images_uploads: Upload[];
  pinned_until: string | null;
  spotify_track_url: string;
  pen_name: string;
}

export interface SpacePostFormBodyProps extends Omit<BoxProps, "children"> {
  form: FormHelper<
    { post: Post },
    SpacePostFormValues,
    (values: SpacePostFormValues) => any
  >;
  postType: PostType;
  prompt: PostPrompt | null | undefined;
  submitLabel: string;
  submitDisabled: boolean;
  onEditorCreated?: (editor: Editor) => void;
}

const PROMPT_CARD_WIDTH = 220;
const PROMPT_CARD_HEIGHT = 140;
const IMAGE_INPUT_SIZE = 140;

const SpacePostFormBody: FC<SpacePostFormBodyProps> = ({
  form,
  postType,
  prompt,
  submitLabel,
  submitDisabled,
  onEditorCreated,
  className,
  ...otherProps
}) => {
  const {
    setFieldValue,
    insertListItem,
    removeListItem,
    getInputProps,
    values,
    errors,
    setTouched,
    watch,
  } = form;

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

  // == Editor mounted state
  const [editorMounted, setEditorMounted] = useState(false);

  // == Viewport height
  const { height: viewportHeight } = useViewportSize();
  const browserDetection = useBrowserDetection();

  // == Pinned until
  const vaulPortalTarget = useVaulPortalTarget();
  const todayDate = useMemo(() => DateTime.now().toJSDate(), []);

  // == Attachments
  const [showSpotifyInput, setShowSpotifyInput] = useState(
    !!values.spotify_track_url,
  );
  const [showImageInput, setShowImageInput] = useState(
    () => !isEmpty(values.images_uploads),
  );
  const [newImageInputKey, setNewImageInputKey] = useState(0);
  const allAttachmentsShown = showSpotifyInput && showImageInput;

  // == Pen name
  const [showPenNameInput, setShowPenNameInput] = useState(false);

  // == Watch for image/spotify changes
  watch("images_uploads", ({ value }) => {
    if (!showImageInput && !isEmpty(value)) {
      setShowImageInput(true);
    }
  });
  watch("spotify_track_url", ({ value }) => {
    setShowSpotifyInput(!!value);
  });

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
    <Stack className={cn("SpacePostFormBody", className)} {...otherProps}>
      {prompt && (
        <Card
          w={PROMPT_CARD_WIDTH}
          h={PROMPT_CARD_HEIGHT}
          bg={prompt.deck.background_color}
          c={prompt.deck.text_color}
          className={classes.promptCard}
        >
          <Text size="xs" ff="heading" ta="center" inline opacity={0.8}>
            {prompt.deck.name}
          </Text>
          <Text fw="bold" ta="center" lh={1.2}>
            {prompt.prompt}
          </Text>
          <Space h="xs" />
        </Card>
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
                  (isIos(browserDetection) || isAndroid(browserDetection)) && {
                    mah: viewportHeight * 0.4,
                  }),
              }}
              onEditorCreated={editor => {
                setEditorMounted(true);
                onEditorCreated?.(editor);
              }}
              onChange={value => {
                setFieldValue("body_html", value);
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
                <Group gap="xs" className={classes.spotifyTrackInputContainer}>
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
      <Stack gap={6}>
        {showPenNameInput ? (
          <TextInput
            {...getInputProps("pen_name")}
            label="pen name"
            size="sm"
            placeholder="the mysterious john darby"
          />
        ) : (
          <Anchor
            component="button"
            size="xs"
            c="dimmed"
            onClick={() => {
              setShowPenNameInput(true);
            }}
          >
            post under an anonymous pen name
          </Anchor>
        )}
        <Button
          type="submit"
          variant="filled"
          size="lg"
          leftSection={submitLabel === "save" ? <SaveIcon /> : <SendIcon />}
          disabled={submitDisabled}
          loading={form.submitting}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
};

export default SpacePostFormBody;

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
