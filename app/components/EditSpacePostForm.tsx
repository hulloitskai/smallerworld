import { map } from "lodash-es";
import { DateTime } from "luxon";

import { htmlHasText } from "~/helpers/richText";
import { mutateSpacePosts } from "~/helpers/spaces";
import {
  parseSpotifyTrackId,
  validateSpotifyTrackUrl,
} from "~/helpers/spotify";
import { type Post, type SpacePost, type Upload } from "~/types";

import SpacePostFormBody, {
  type SpacePostFormValues,
} from "./SpacePostFormBody";

export interface EditSpacePostFormProps extends Omit<BoxProps, "children"> {
  spaceId: string;
  post: SpacePost;
  onPostUpdated?: (post: Post) => void;
}

interface EditSpacePostFormValues extends SpacePostFormValues {}

interface EditSpacePostSubmission {
  post: {
    emoji: string | null;
    title: string | null;
    body_html: string;
    images: string[];
    pinned_until: string | null;
    spotify_track_id: string | null;
  };
}

const EditSpacePostForm: FC<EditSpacePostFormProps> = ({
  spaceId,
  post,
  onPostUpdated,
  ...otherProps
}) => {
  const postType = post.type;

  const initialValues = useMemo<EditSpacePostFormValues>(() => {
    const {
      title,
      body_html,
      emoji,
      images,
      pinned_until,
      spotify_track_id,
      pen_name,
    } = post;
    return {
      title: title ?? "",
      body_html: body_html ?? "",
      emoji: emoji ?? "",
      images_uploads: images
        ? images.map<Upload>(image => ({ signedId: image.signed_id }))
        : [],
      pinned_until: pinned_until ?? null,
      spotify_track_url: spotify_track_id
        ? `https://open.spotify.com/track/${spotify_track_id}`
        : "",
      pen_name: pen_name ?? "",
    };
  }, [post]);

  const form = useForm<
    { post: Post },
    EditSpacePostFormValues,
    (values: EditSpacePostFormValues) => EditSpacePostSubmission
  >({
    action: routes.spacePosts.update,
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
      spotify_track_url,
      pen_name,
      ...values
    }) => ({
      post: {
        ...values,
        emoji: emoji || null,
        title: title || null,
        images: map(images_uploads, "signedId"),
        pinned_until: pinned_until ? formatPinnedUntil(pinned_until) : null,
        spotify_track_id: spotify_track_url
          ? parseSpotifyTrackId(spotify_track_url)
          : null,
        pen_name: pen_name || null,
      },
    }),
    transformErrors: ({ image, spotify_track_id, ...errors }) => ({
      ...errors,
      image_upload: image,
      spotify_track_url: spotify_track_id,
    }),
    onSuccess: ({ post: updatedPost }) => {
      void mutateSpacePosts(spaceId);
      onPostUpdated?.(updatedPost);
    },
  });
  const { initialize } = form;
  useDidUpdate(() => {
    initialize(initialValues);
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box component="form" onSubmit={form.submit} {...otherProps}>
      <SpacePostFormBody
        {...{ form, postType }}
        prompt={post.prompt}
        submitLabel="save"
        submitDisabled={
          !form.isDirty() ||
          !form.isValid() ||
          !htmlHasText(form.values.body_html)
        }
      />
    </Box>
  );
};

export default EditSpacePostForm;

const formatPinnedUntil = (dateString: string): string =>
  DateTime.fromISO(dateString, { zone: "local" })
    .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
    .toISO();
