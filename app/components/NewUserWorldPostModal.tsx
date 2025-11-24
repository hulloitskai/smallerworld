import { closeAllModals, openModal } from "@mantine/modals";

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
}: NewUserWorldPostModalOptions): string =>
  openModal({
    title: `new ${POST_TYPE_TO_LABEL[postType]}`,
    size: "var(--container-size-xs)",
    children: (
      <PostForm
        newPostType={postType}
        {...{ encouragement }}
        onPostCreated={post => {
          closeAllModals();
          onPostCreated?.(post);
        }}
      />
    ),
  });
