import {
  Accordion,
  Input,
  ScrollArea,
  SegmentedControl,
  Table,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useLongPress, useMergedRef, useViewportSize } from "@mantine/hooks";
import { type Editor } from "@tiptap/react";
import { sortBy } from "lodash-es";
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
import { type FormHelper } from "~/helpers/form";
import { prettyFriendName } from "~/helpers/friends";
import {
  POST_BODY_PLACEHOLDERS,
  POST_TITLE_PLACEHOLDERS,
  POST_VISIBILITIES,
  POST_VISIBILITY_DESCRIPTORS,
  POST_VISIBILITY_TO_ICON,
  POST_VISIBILITY_TO_LABEL,
  postTypeHasTitle,
} from "~/helpers/posts";
import {
  type Encouragement,
  type Post,
  type PostPrompt,
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

import classes from "./WorldPostFormBody.module.css";
import "@mantine/dates/styles.css";

export interface WorldPostFormValues {
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

const IMAGE_INPUT_SIZE = 140;
const PROMPT_CARD_WIDTH = 220;
const PROMPT_CARD_HEIGHT = 140;

export interface WorldPostFormBodyProps extends Omit<BoxProps, "children"> {
  form: FormHelper<
    { post: Post },
    WorldPostFormValues,
    (values: WorldPostFormValues) => any
  >;
  postType: PostType;
  prompt: PostPrompt | null | undefined;
  encouragementId: string | undefined;
  quotedPost: QuotedPost | null | undefined;
  subscribedFriends: UserWorldFriendProfile[] | undefined;
  submitLabel: string;
  submitDisabled: boolean;
  postId?: string;
  onEditorCreated?: (editor: Editor) => void;
}

const WorldPostFormBody: FC<WorldPostFormBodyProps> = ({
  form,
  postType,
  prompt,
  encouragementId,
  quotedPost,
  subscribedFriends,
  submitLabel,
  submitDisabled,
  className,
  postId,
  onEditorCreated,
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

  // == Load encouragement
  const { data: encouragementData } = useRouteSWR<{
    encouragement: Encouragement;
  }>(routes.userWorldEncouragements.show, {
    params: encouragementId ? { id: encouragementId } : null,
    descriptor: "load encouragement",
  });
  const { encouragement } = encouragementData ?? {};

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

  // == Watch for image/spotify changes
  watch("images_uploads", ({ value }) => {
    if (!showImageInput && !isEmpty(value)) {
      setShowImageInput(true);
    }
  });
  watch("spotify_track_url", ({ value }) => {
    setShowSpotifyInput(!!value);
  });

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
    <Stack className={cn("WorldPostFormBody", className)} {...otherProps}>
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
                {postId ? "is" : "will be"} attached.{" "}
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
                          {...{ postId }}
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
        leftSection={postId ? <SaveIcon /> : <SendIcon />}
        disabled={submitDisabled}
        loading={form.submitting}
      >
        {submitLabel}
      </Button>
    </Stack>
  );
};

export default WorldPostFormBody;

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
