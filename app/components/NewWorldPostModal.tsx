import { type ModalSettings } from "node_modules/@mantine/modals/lib/context";

import { POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Post, type PostType } from "~/types";

import WorldPostForm, { type WorldPostFormProps } from "./WorldPostForm";

export interface NewWorldPostModalOptions
  extends Pick<WorldPostFormProps, "worldId">,
    Omit<ModalSettings, "children"> {
  postType: PostType;
  encouragementId?: string;
  onPostCreated?: (post: Post) => void;
}

export const openNewWorldPostModal = ({
  worldId,
  postType,
  encouragementId,
  onPostCreated,
  ...otherProps
}: NewWorldPostModalOptions): void => {
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
        {...{ encouragementId }}
        onPostCreated={post => {
          closeModal(modalId);
          onPostCreated?.(post);
        }}
      />
    ),
  });
};
