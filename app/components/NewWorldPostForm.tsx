import { type Editor } from "@tiptap/react";
import { invertBy, map, uniq } from "lodash-es";

import {
  NONPRIVATE_POST_VISIBILITIES,
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
  type Post,
  type PostPrompt,
  type PostType,
  type PostVisibility,
  type UserWorldFriendProfile,
} from "~/types";

import WorldPostFormBody, {
  type WorldPostFormValues,
} from "./WorldPostFormBody";

export interface NewWorldPostFormProps extends Omit<BoxProps, "children"> {
  worldId: string;
  postType: PostType;
  prompt?: PostPrompt;
  encouragementId?: string;
  quotedPost?: Post;
  onPostCreated?: (post: Post) => void;
}

const DEFAULT_VISIBILITY: PostVisibility = "friends";

interface NewWorldPostFormValues extends WorldPostFormValues {}

interface NewWorldPostSubmission {
  post: {
    type: PostType;
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
    quoted_post_id: string | null;
    prompt_id: string | null;
  };
}

const NewWorldPostForm: FC<NewWorldPostFormProps> = ({
  worldId,
  postType,
  prompt,
  encouragementId,
  quotedPost,
  onPostCreated,
  className,
  ...otherProps
}) => {
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

  // == Editor ref for draft restoration
  const editorRef = useRef<Editor | null>(null);

  // == Draft values
  const [draftValues, saveDraftValues, clearDraft] =
    usePostDraftFormValues<WorldPostFormValues>({
      postType,
      localStorageKey: worldPostDraftKey(worldId),
    });

  const initialValues = useMemo<NewWorldPostFormValues>(
    () => ({
      title: "",
      body_html: "",
      emoji: "",
      images_uploads: [],
      visibility: DEFAULT_VISIBILITY,
      pinned_until: null,
      friend_notifiability: subscribedFriends
        ? buildFriendNotifiability(subscribedFriends, DEFAULT_VISIBILITY)
        : {},
      encouragement_id: encouragementId ?? null,
      spotify_track_url: "",
    }),
    [encouragementId, subscribedFriends],
  );
  const form = useForm<
    { post: Post },
    NewWorldPostFormValues,
    (values: NewWorldPostFormValues) => NewWorldPostSubmission
  >({
    action: routes.userWorldPosts.create,
    descriptor: "create post",
    initialValues,
    validate: {
      spotify_track_url: validateSpotifyTrackUrl,
    },
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
          title: title || null,
          spotify_track_url: spotify_track_url || null,
          images: map(images_uploads, "signedId"),
          quoted_post_id: quotedPost?.id ?? null,
          pinned_until: pinned_until ? formatPinnedUntil(pinned_until) : null,
          spotify_track_id: spotify_track_url
            ? parseSpotifyTrackId(spotify_track_url)
            : null,
          visibility,
          encouragement_id,
          prompt_id: prompt?.id ?? null,
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
    onValuesChange: values => {
      if (form.isTouched()) {
        shouldRestoreDraftRef.current = false;
        saveDraftValues(values);
      }
    },
    onSuccess: ({ post }) => {
      clearDraft();
      void mutateRoute(routes.userWorldEncouragements.index);
      void mutateWorldTimeline(worldId);
      void mutateUserWorldPosts();
      void mutateUserUniversePosts();
      void mutateRoute(routes.userWorldPosts.pinned);
      onPostCreated?.(post);
    },
  });
  const { initialize, setValues, watch, setFieldValue } = form;
  useDidUpdate(() => {
    initialize(initialValues);
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  // == Draft restoration
  const shouldRestoreDraftRef = useRef(true);
  useDidUpdate(() => {
    if (draftValues && shouldRestoreDraftRef.current) {
      shouldRestoreDraftRef.current = false;
      setValues(draftValues);
      const editor = editorRef.current;
      if (editor) {
        editor.commands.setContent(draftValues.body_html);
      }
    }
  }, [draftValues]); // eslint-disable-line react-hooks/exhaustive-deps

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
      buildFriendNotifiability(subscribedFriends, value),
    );
  });

  return (
    <Box
      component="form"
      onSubmit={form.submit}
      className={cn("NewWorldPostForm", className)}
      {...otherProps}
    >
      <WorldPostFormBody
        {...{ form, postType, prompt, quotedPost, subscribedFriends }}
        encouragementId={encouragementId}
        onEditorCreated={editor => {
          editorRef.current = editor;
          const values = form.getValues();
          editor.commands.setContent(values.body_html);
        }}
        submitLabel="post"
        submitDisabled={
          !form.isDirty() ||
          !form.isValid() ||
          !htmlHasText(form.values.body_html)
        }
      />
    </Box>
  );
};

export default NewWorldPostForm;

const formatPinnedUntil = (dateString: string): string =>
  DateTime.fromISO(dateString, { zone: "local" })
    .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
    .toISO();

const buildFriendNotifiability = (
  friends: UserWorldFriendProfile[],
  visibility: PostVisibility,
): Record<string, "hidden" | "muted" | "notify"> =>
  mapValues(keyBy(friends, "id"), friend =>
    visibility === "secret"
      ? "hidden"
      : friend.paused_since
        ? "hidden"
        : friend.notifiable === "push"
          ? "notify"
          : "muted",
  );
