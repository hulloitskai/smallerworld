import { useLocalStorage, useThrottledCallback } from "@mantine/hooks";

import { type PostType, type Upload } from "~/types";

import { htmlHasText } from "../richText";

interface PostFormContentValues {
  body_html: string;
  title: string;
  pinned_until: string | null;
  emoji: string;
  images_uploads: Upload[];
  spotify_track_url: string;
}

export interface PostDraft<FormValues extends PostFormContentValues> {
  postType: PostType;
  formValues: FormValues;
}

export interface UsePostDraftFormValuesParams {
  localStorageKey: string;
  postType: PostType | undefined;
}

export const usePostDraftFormValues = <Values extends PostFormContentValues>({
  localStorageKey,
  postType,
}: UsePostDraftFormValuesParams): [
  Values | undefined,
  (values: Values) => void,
  () => void,
] => {
  const [draft, setDraft, clearDraft] = useLocalStorage<
    PostDraft<Values> | undefined
  >({
    key: localStorageKey,
  });
  const saveValues = useThrottledCallback((values: Values) => {
    if (!postType) {
      return;
    }
    if (draftHasContent(values)) {
      if (!(import.meta.env.RAILS_ENV === "production")) {
        console.debug("Saving draft...", { postType, values });
      }
      setDraft({ postType, formValues: values });
    } else {
      if (!(import.meta.env.RAILS_ENV === "production")) {
        console.debug("Clearing draft...", { postType });
      }
      clearDraft();
    }
  }, 500);
  const values = draft?.postType === postType ? draft?.formValues : undefined;
  return [values, saveValues, clearDraft];
};

interface UseSavedDraftTypeParams {
  localStorageKey: string;
}

export const useSavedDraftType = ({
  localStorageKey,
}: UseSavedDraftTypeParams): PostType | undefined => {
  const [draft] = useLocalStorage<PostDraft<any> | undefined>({
    key: localStorageKey,
  });
  return draft?.postType;
};

const draftHasContent = ({
  body_html,
  ...otherValues
}: PostFormContentValues) => {
  if (!htmlHasText(body_html)) {
    return false;
  }
  const contentValues = Object.values(pick(otherValues));
  return contentValues.every(value =>
    typeof value === "string" ? !value.trim() : isEmpty(value),
  );
};
