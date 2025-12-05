import { type ModalSettings } from "node_modules/@mantine/modals/lib/context";

import { POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Post, type PostPrompt, type PostType } from "~/types";

import WorldPostForm, { type WorldPostFormProps } from "./WorldPostForm";

export interface NewWorldPostModalProps
  extends Pick<WorldPostFormProps, "worldId">,
    Omit<ModalSettings, "children"> {
  postType: PostType;
  encouragementId?: string;
  prompt?: PostPrompt;
  onPostCreated?: (post: Post) => void;
}

export const openNewWorldPostModal = ({
  worldId,
  postType,
  encouragementId,
  prompt,
  onPostCreated,
  ...otherProps
}: NewWorldPostModalProps): void => {
  const modalId = randomId();
  openModal({
    modalId,
    title: `new ${POST_TYPE_TO_LABEL[postType]}`,
    size: "var(--container-size-xs)",
    ...otherProps,
    children: (
      <WorldPostForm
        {...{ worldId }}
        newPostType={postType}
        {...{ encouragementId, prompt }}
        onPostCreated={post => {
          closeModal(modalId);
          onPostCreated?.(post);
        }}
      />
    ),
  });
};
