import { difference, invertBy, map, uniq } from "lodash-es";

import { NONPRIVATE_POST_VISIBILITIES } from "~/helpers/posts";
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
  type PostVisibility,
  type Upload,
  type UserWorldFriendProfile,
} from "~/types";

import WorldPostFormBody, {
  type WorldPostFormValues,
} from "./WorldPostFormBody";

export interface EditWorldPostFormProps extends Omit<BoxProps, "children"> {
  worldId: string;
  post: Post;
  onPostUpdated?: (post: Post) => void;
}

interface EditWorldPostFormValues extends WorldPostFormValues {}

interface EditWorldPostSubmission {
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
  };
}

const EditWorldPostForm: FC<EditWorldPostFormProps> = ({
  worldId,
  post,
  onPostUpdated,
  className,
  ...otherProps
}) => {
  const postType = post.type;

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

  // == Load post audience
  const { data: audienceData } = useRouteSWR<{
    hiddenFromIds: string[];
    notifiedIds: string[];
    visibleToIds: string[];
  }>(routes.userWorldPosts.audience, {
    params: { id: post.id },
    descriptor: "load post audience",
  });

  // == Form
  const initialValues = useMemo<WorldPostFormValues>(() => {
    const {
      title,
      body_html,
      emoji,
      images,
      pinned_until,
      encouragement,
      spotify_track_id,
      visibility,
    } = post;
    return {
      title: title ?? "",
      body_html: body_html ?? "",
      emoji: emoji ?? "",
      images_uploads: images
        ? images.map<Upload>(image => ({ signedId: image.signed_id }))
        : [],
      visibility,
      pinned_until: pinned_until ?? null,
      friend_notifiability:
        subscribedFriends && audienceData
          ? buildFriendNotifiability(
              subscribedFriends,
              visibility,
              audienceData,
            )
          : {},
      encouragement_id: encouragement?.id ?? null,
      spotify_track_url: spotify_track_id
        ? `https://open.spotify.com/track/${spotify_track_id}`
        : "",
    };
  }, [post, subscribedFriends, audienceData]);

  const form = useForm<
    { post: Post },
    EditWorldPostFormValues,
    (values: EditWorldPostFormValues) => EditWorldPostSubmission
  >({
    action: routes.userWorldPosts.update,
    params: { id: post.id },
    descriptor: "update post",
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
      return {
        post: {
          ...values,
          emoji: emoji || null,
          title: title || null,
          images: map(images_uploads, "signedId"),
          pinned_until: pinned_until ? formatPinnedUntil(pinned_until) : null,
          visibility,
          spotify_track_id: spotify_track_url
            ? parseSpotifyTrackId(spotify_track_url)
            : null,
          friend_ids_to_notify: difference(friendIdsToNotify, notifiedIds),
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
    transformErrors: ({ image, spotify_track_id, ...errors }) => ({
      ...errors,
      image_upload: image,
      spotify_track_url: spotify_track_id,
    }),
    onSuccess: ({ post: updatedPost }) => {
      void mutateRoute(routes.userWorldPosts.audience, { id: post.id });
      void mutateWorldTimeline(worldId);
      void mutateUserWorldPosts();
      void mutateUserUniversePosts();
      void mutateRoute(routes.userWorldPosts.pinned);
      onPostUpdated?.(updatedPost);
    },
  });
  const { initialize, watch, setFieldValue } = form;
  useDidUpdate(() => {
    initialize(initialValues);
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  // == Update friend notifiability when visibility changes
  watch("visibility", ({ value, previousValue }) => {
    if (
      NONPRIVATE_POST_VISIBILITIES.includes(value) &&
      NONPRIVATE_POST_VISIBILITIES.includes(previousValue ?? "")
    ) {
      return;
    }
    if (!subscribedFriends || !audienceData) {
      return;
    }
    setFieldValue(
      "friend_notifiability",
      buildFriendNotifiability(subscribedFriends, value, audienceData),
    );
  });

  return (
    <Box
      component="form"
      onSubmit={form.submit}
      className={cn("EditWorldPostForm", className)}
      {...otherProps}
    >
      <WorldPostFormBody
        {...{ form, postType, subscribedFriends }}
        postId={post.id}
        prompt={post.prompt}
        encouragementId={post.encouragement?.id}
        quotedPost={post.quoted_post}
        submitLabel="save"
        submitDisabled={
          !form.isDirty() ||
          !form.isValid() ||
          !htmlHasText(form.values.body_html) ||
          !audienceData
        }
      />
    </Box>
  );
};

export default EditWorldPostForm;

const formatPinnedUntil = (dateString: string): string =>
  DateTime.fromISO(dateString, { zone: "local" })
    .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
    .toISO();

const buildFriendNotifiability = (
  friends: UserWorldFriendProfile[],
  visibility: PostVisibility,
  audienceData: {
    hiddenFromIds: string[];
    notifiedIds: string[];
    visibleToIds: string[];
  },
): Record<string, "hidden" | "muted" | "notify"> =>
  mapValues(keyBy(friends, "id"), friend =>
    audienceData.notifiedIds.includes(friend.id)
      ? "notify"
      : visibility === "secret"
        ? audienceData.visibleToIds.includes(friend.id)
          ? "muted"
          : "hidden"
        : audienceData.hiddenFromIds.includes(friend.id)
          ? "hidden"
          : "muted",
  );
