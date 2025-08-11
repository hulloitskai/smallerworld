import { useLocalStorage, useThrottledCallback } from "@mantine/hooks";

import { type PostType, type PostVisibility, type Upload } from "~/types";

export interface PostFormValues {
  title: string;
  body_html: string;
  emoji: string;
  images_uploads: Upload[];
  visibility: PostVisibility;
  pinned_until: string | null;
  quiet: boolean;
  hidden_from_ids: string[];
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
    pick(otherValues, "title", "pinned_until", "emoji", "images_uploads"),
  );
  return contentValues.every(value =>
    typeof value === "string" ? !value.trim() : isEmpty(value),
  );
};

export const usePostDraftValues = (
  postType: PostType | null | undefined,
): [
  () => PostFormValues | undefined,
  (values: PostFormValues) => void,
  () => void,
] => {
  const [, setDraft, clearDraft] = useLocalStorage<PostDraft | undefined>({
    key: "new_post_draft",
    getInitialValueInEffect: false,
  });
  const loadValues = (): PostFormValues | undefined => {
    const serializedDraft = localStorage.getItem("new_post_draft");
    if (!serializedDraft) {
      return;
    }
    const draft: PostDraft = JSON.parse(serializedDraft);
    if (draft.postType !== postType) {
      return;
    }
    return draft.values;
  };
  const saveValues = useThrottledCallback((values: PostFormValues) => {
    if (!postType) {
      return;
    }
    if (!postFormValuesIsEmpty(values)) {
      console.debug("Saving draft...", { postType, values });
      setDraft({ postType, values });
    } else {
      console.debug("Clearing draft...", { postType });
      clearDraft();
    }
  }, 500);
  return [loadValues, saveValues, clearDraft];
};

export const useSavedDraftType = (): PostType | undefined => {
  const [draft] = useLocalStorage<PostDraft | undefined>({
    key: "new_post_draft",
    getInitialValueInEffect: false,
  });
  return draft?.postType;
};
