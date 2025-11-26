import { POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Encouragement, type PostType, type UserWorldPost } from "~/types";

import PostForm from "./PostForm";

export interface NewUserWorldPostModalOptions {
  postType: PostType;
  encouragement?: Encouragement;
  onPostCreated?: (post: UserWorldPost) => void;
}

export const openNewUserWorldPostModal = ({
  postType,
  encouragement,
  onPostCreated,
}: NewUserWorldPostModalOptions): void => {
  const modalId = randomId();
  openModal({
    modalId,
    title: `new ${POST_TYPE_TO_LABEL[postType]}`,
    size: "var(--container-size-xs)",
    children: (
      <PostForm
        newPostType={postType}
        {...{ encouragement }}
        onPostCreated={post => {
          closeModal(modalId);
          onPostCreated?.(post);
        }}
      />
    ),
  });
};
