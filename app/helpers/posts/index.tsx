import { useInViewport } from "@mantine/hooks";
import {
  type FC,
  type RefCallback,
  type SVGProps,
  useEffect,
  useRef,
} from "react";

import JournalEntryIcon from "~icons/basil/book-solid";
import FollowUpIcon from "~icons/heroicons/arrow-path-rounded-square-20-solid";
import InvitationIcon from "~icons/heroicons/envelope-open-20-solid";
import LockIcon from "~icons/heroicons/lock-closed-20-solid";
import PoemIcon from "~icons/heroicons/pencil-20-solid";
import QuestionIcon from "~icons/heroicons/question-mark-circle-20-solid";

import { ChosenFamilyIcon, FriendsIcon, PublicIcon } from "~/components/icons";
import {
  type AssociatedFriend,
  type Post,
  type PostType,
  type PostVisibility,
} from "~/types";

import { useCurrentFriend } from "../authentication";
import routes from "../routes";
import { fetchRoute } from "../routes/fetch";

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

interface TrackPostSeenOptions {
  skip?: boolean;
  asFriend?: AssociatedFriend;
}

export const useTrackPostSeen = <T extends HTMLElement>(
  post: Post,
  options?: TrackPostSeenOptions,
): RefCallback<T | null> => {
  const { skip, asFriend } = options ?? {};
  const currentFriend = useCurrentFriend();
  const friend = asFriend ?? currentFriend;
  const { ref, inViewport } = useInViewport<T>();
  const markedSeenRef = useRef(false);
  useEffect(() => {
    if (!inViewport || skip || markedSeenRef.current) {
      return;
    }
    const timeout = setTimeout(() => {
      void fetchRoute<{ worldId: string }>(routes.posts.markSeen, {
        params: {
          id: post.id,
          query: {
            ...(friend && {
              friend_token: friend.access_token,
            }),
          },
        },
        descriptor: "mark post as seen",
        failSilently: true,
      }).then(() => {
        markedSeenRef.current = true;
      });
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [inViewport]); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
};
