import { type ModalSettings } from "node_modules/@mantine/modals/lib/context";

import { POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Post } from "~/types";

import EditWorldPostForm, {
  type EditWorldPostFormProps,
} from "./EditWorldPostForm";

export interface EditWorldPostModalProps
  extends Pick<EditWorldPostFormProps, "worldId" | "post">,
    Omit<ModalSettings, "children"> {
  onPostUpdated?: (post: Post) => void;
}

export const openEditWorldPostModal = ({
  worldId,
  post,
  onPostUpdated,
  ...otherProps
}: EditWorldPostModalProps): void => {
  const modalId = randomId();
  openModal({
    modalId,
    title: `edit ${POST_TYPE_TO_LABEL[post.type]}`,
    size: "var(--container-size-xs)",
    ...otherProps,
    children: (
      <EditWorldPostForm
        {...{ worldId, post }}
        onPostUpdated={updatedPost => {
          closeModal(modalId);
          onPostUpdated?.(updatedPost);
        }}
      />
    ),
  });
};
