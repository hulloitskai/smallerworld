import { type SVGProps } from "react";

import JournalEntryIcon from "~icons/basil/book-solid";
import FollowUpIcon from "~icons/heroicons/arrow-path-rounded-square-20-solid";
import InvitationIcon from "~icons/heroicons/envelope-open-20-solid";
import LockIcon from "~icons/heroicons/lock-closed-20-solid";
import PoemIcon from "~icons/heroicons/pencil-20-solid";
import QuestionIcon from "~icons/heroicons/question-mark-circle-20-solid";

import { type PostType, type PostVisibility } from "~/types";

export { POST_TYPE_TO_LABEL, POST_VISIBILITY_TO_LABEL } from "./formatting";

export const POST_TYPES: PostType[] = [
  "journal_entry",
  "poem",
  "invitation",
  "question",
];

export const POST_VISIBILITIES: PostVisibility[] = [
  "secret",
  "friends",
  "public",
  // "chosen_family",
];

export const NONPRIVATE_POST_VISIBILITIES: PostVisibility[] = [
  "friends",
  "public",
];

export const POST_VISIBILITY_DESCRIPTORS: Record<PostVisibility, string> = {
  public: "anyone can see this post",
  friends: "only friends you invite can see this post",
  secret: "only visible to you and selected friends",
  chosen_family: "UNIMPLEMENTED",
};

export const POST_TYPE_TO_ICON: Record<
  PostType,
  FC<SVGProps<SVGSVGElement>>
> = {
  journal_entry: JournalEntryIcon,
  poem: PoemIcon,
  invitation: InvitationIcon,
  question: QuestionIcon,
  follow_up: FollowUpIcon,
};

export const POST_VISIBILITY_TO_ICON: Record<
  PostVisibility,
  FC<SVGProps<SVGSVGElement>>
> = {
  public: PublicIcon,
  friends: FriendsIcon,
  chosen_family: ChosenFamilyIcon,
  secret: LockIcon,
};
