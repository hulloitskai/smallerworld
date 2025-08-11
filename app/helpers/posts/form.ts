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

export interface NewPostDraft {
  postType: PostType;
  values: PostFormValues;
}

const postFormValuesIsEmpty = ({
  body_html,
  ...otherValues
}: PostFormValues) => {
  if (!!body_html && body_html !== "<p></p>") {
    return false;
  }
  const contentValues = Object.values(
    pick(otherValues, "title", "pinned_until", "emoji"),
  );
  return contentValues.every(value =>
    typeof value === "string" ? !value.trim() : !value,
  );
};

export const useNewPostDraft = (): [
  NewPostDraft | undefined,
  (draft: NewPostDraft) => void,
  () => void,
] => {
  const [draft, setDraft, clearDraft] = useLocalStorage<
    NewPostDraft | undefined
  >({
    key: "new_post_draft",
    getInitialValueInEffect: false,
  });
  const saveDraft = useThrottledCallback((newDraft: NewPostDraft | null) => {
    if (
      newDraft &&
      !postFormValuesIsEmpty(newDraft.values) &&
      (!draft || !isEqual(draft.values, newDraft.values))
    ) {
      console.debug("Saving draft...", newDraft);
      setDraft(newDraft);
    } else {
      clearDraft();
    }
  }, 500);
  return [draft, saveDraft, clearDraft];
};
