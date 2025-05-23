import { type PostType, type PostVisibility } from "~/types";

export const POST_TYPE_TO_LABEL: Record<PostType, string> = {
  journal_entry: "journal entry",
  poem: "poem",
  invitation: "invitation",
  question: "question",
  follow_up: "follow-up",
};

export const POST_VISIBILITY_TO_LABEL: Record<PostVisibility, string> = {
  public: "public",
  friends: "friends",
  chosen_family: "chosen family",
  only_me: "only me",
};
