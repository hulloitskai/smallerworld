import { useLocalStorage, useThrottledCallback } from "@mantine/hooks";

import { type PostType, type PostVisibility, type Upload } from "~/types";

export interface PostFormValues {
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

export interface PostFormSubmission {
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

interface PostDraft {
  postType: PostType;
  values: PostFormValues;
}

const postFormValuesIsEmpty = ({
  body_html,
  ...otherValues
}: PostFormValues) => {
  if (body_html && body_html !== "<p></p>") {
    return false;
  }
  const contentValues = Object.values(
    pick(
      otherValues,
      "title",
      "pinned_until",
      "emoji",
      "images_uploads",
      "spotify_track_url",
    ),
  );
  return contentValues.every(value =>
    typeof value === "string" ? !value.trim() : isEmpty(value),
  );
};

export const usePostDraftValues = (
  postType: PostType | null | undefined,
): [
  PostFormValues | undefined,
  (values: PostFormValues) => void,
  () => void,
] => {
  const [draft, setDraft, clearDraft] = useLocalStorage<PostDraft | undefined>({
    key: "new_post_draft",
  });
  const saveValues = useThrottledCallback((values: PostFormValues) => {
    if (!postType) {
      return;
    }
    if (!postFormValuesIsEmpty(values)) {
      if (!(import.meta.env.RAILS_ENV === "production")) {
        console.debug("Saving draft...", { postType, values });
      }
      setDraft({ postType, values });
    } else {
      if (!(import.meta.env.RAILS_ENV === "production")) {
        console.debug("Clearing draft...", { postType });
      }
      clearDraft();
    }
  }, 500);
  const values = draft?.postType === postType ? draft?.values : undefined;
  return [values, saveValues, clearDraft];
};

export const useSavedDraftType = (): PostType | undefined => {
  const [draft] = useLocalStorage<PostDraft | undefined>({
    key: "new_post_draft",
    getInitialValueInEffect: false,
  });
  return draft?.postType;
};
