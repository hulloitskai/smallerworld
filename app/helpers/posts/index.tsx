import { useNetwork } from "@mantine/hooks";
import { type SVGProps } from "react";
import { mutate } from "swr";
import { cache } from "swr/_internal";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import JournalEntryIcon from "~icons/basil/book-solid";
import FollowUpIcon from "~icons/heroicons/arrow-path-rounded-square-20-solid";
import InvitationIcon from "~icons/heroicons/envelope-open-20-solid";
import LockIcon from "~icons/heroicons/lock-closed-20-solid";
import PoemIcon from "~icons/heroicons/pencil-20-solid";
import QuestionIcon from "~icons/heroicons/question-mark-circle-20-solid";

import PostForm from "~/components/PostForm";
import {
  type Encouragement,
  type PostType,
  type PostVisibility,
  type WorldPost,
} from "~/types";

import { POST_TYPE_TO_LABEL } from "./formatting";

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

export interface WorldPostsData {
  posts: WorldPost[];
  pagination: { next: string | number | null };
}

interface WorldPostParams {
  type?: PostType | null;
  date?: string | null;
  searchQuery?: string;
}

const worldPostsGetKey = (
  params?: WorldPostParams,
): SWRInfiniteKeyLoader<WorldPostsData> => {
  return (index, previousPageData): string | null => {
    const query: Record<string, string> = {};
    if (params?.type) {
      query.type = params.type;
    }
    if (params?.date) {
      query.date = DateTime.fromISO(params.date).toLocal().toISO();
    }
    if (params?.searchQuery) {
      query.q = params.searchQuery;
    }
    if (previousPageData) {
      const { next } = previousPageData.pagination;
      if (!next) {
        return null;
      }
      query.page = next.toString();
    }
    return routes.worldPosts.index.path({ query });
  };
};

export interface WorldPostsOptions
  extends SWRInfiniteConfiguration<WorldPostsData> {
  type?: PostType | null;
  date?: string | null;
  searchQuery?: string;
}

export const useWorldPosts = (options?: WorldPostsOptions) => {
  const { online } = useNetwork();
  const { ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<WorldPostsData>(
    worldPostsGetKey(options),
    (url: string) => fetchRoute(url, { descriptor: "load posts" }),
    {
      keepPreviousData: true,
      isOnline: () => online,
      ...swrConfiguration,
    },
  );
  const posts = useMemo(() => data?.flatMap(({ posts }) => posts), [data]);
  const hasMorePosts = useMemo(() => {
    if (data) {
      const lastPage = last(data);
      return lastPage ? !!lastPage.pagination.next : false;
    }
  }, [data]);
  return { posts, hasMorePosts, ...swrResponse };
};

// TODO: Account for type param
export const mutateWorldPosts = async (): Promise<void> => {
  const postsPath = routes.worldPosts.index.path();
  const mutations: Promise<void>[] = [];
  for (const path of cache.keys()) {
    const url = hrefToUrl(path);
    if (url.pathname === postsPath) {
      const getKey: SWRInfiniteKeyLoader<WorldPostsData> = (
        index,
        previousPageData,
      ) => {
        const query: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          query[key] = value;
        });
        if (previousPageData) {
          const { next } = previousPageData.pagination;
          if (!next) {
            return null;
          }
          query.page = next.toString();
        }
        return routes.worldPosts.index.path({ query });
      };
      mutations.push(mutate(unstable_serialize(getKey)));
    }
  }
  await Promise.all(mutations);
};

export interface NewPostModalOptions {
  postType: PostType;
  encouragement?: Encouragement;
  onPostCreated?: (post: WorldPost) => void;
}

export const openNewPostModal = ({
  postType,
  encouragement,
  onPostCreated,
}: NewPostModalOptions): void => {
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
};
