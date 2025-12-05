import { type ModalSettings } from "node_modules/@mantine/modals/lib/context";

import { POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Post, type PostPrompt, type PostType } from "~/types";

import NewSpacePostForm, {
  type NewSpacePostFormProps,
} from "./NewSpacePostForm";

export interface NewSpacePostModalProps
  extends Pick<NewSpacePostFormProps, "spaceId">,
    Omit<ModalSettings, "children"> {
  postType: PostType;
  prompt?: PostPrompt;
  onPostCreated?: (post: Post) => void;
}

export const openNewSpacePostModal = ({
  spaceId,
  postType,
  prompt,
  onPostCreated,
  ...otherProps
}: NewSpacePostModalProps): void => {
  const modalId = randomId();
  openModal({
    modalId,
    title: `new ${POST_TYPE_TO_LABEL[postType]}`,
    size: "var(--container-size-xs)",
    ...otherProps,
    children: (
      <NewSpacePostForm
        {...{ spaceId }}
        postType={postType}
        {...{ prompt }}
        onPostCreated={post => {
          closeModal(modalId);
          onPostCreated?.(post);
        }}
      />
    ),
  });
};
