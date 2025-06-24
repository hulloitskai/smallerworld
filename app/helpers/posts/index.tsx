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

import { type PostType, type PostVisibility, type WorldPost } from "~/types";

export { POST_TYPE_TO_LABEL, POST_VISIBILITY_TO_LABEL } from "./formatting";

export const POST_TYPES: PostType[] = [
  "journal_entry",
  "poem",
  "invitation",
  "question",
];

export const POST_VISIBILITIES: PostVisibility[] = [
  "friends",
  "public",
  "only_me",
  // "chosen_family",
];

export const NONPRIVATE_POST_VISIBILITIES: PostVisibility[] = [
  "friends",
  "public",
];

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
  only_me: LockIcon,
};

export interface PostsData {
  posts: WorldPost[];
  pagination: { next: string | number | null };
}

interface PostParams {
  type?: PostType | null;
  searchQuery?: string;
}

const postsGetKey = (params?: PostParams): SWRInfiniteKeyLoader<PostsData> => {
  return (index, previousPageData): string | null => {
    const query: Record<string, any> = {};
    if (params?.type) {
      query.type = params.type;
    }
    if (params?.searchQuery) {
      query.q = params.searchQuery;
    }
    if (previousPageData) {
      const { next } = previousPageData.pagination;
      if (!next) {
        return null;
      }
      query.page = next;
    }
    return routes.posts.index.path({ query });
  };
};

export interface PostsOptions extends SWRInfiniteConfiguration<PostsData> {
  type?: PostType | null;
  searchQuery?: string;
  limit?: number;
}

export const usePosts = (options?: PostsOptions) => {
  const { online } = useNetwork();
  const { ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<PostsData>(
    postsGetKey(options),
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
export const mutatePosts = async (): Promise<void> => {
  const postsPath = routes.posts.index.path();
  const searchQueries = new Set<string>();
  for (const key of cache.keys()) {
    const url = new URL(key, location.origin);
    if (url.pathname === postsPath) {
      const searchQuery = url.searchParams.get("q");
      if (searchQuery) {
        searchQueries.add(searchQuery);
      }
    }
  }
  const mutations = [undefined, ...searchQueries].map(searchQuery =>
    mutate<PostsData>(unstable_serialize(postsGetKey({ searchQuery }))),
  );
  await Promise.all(mutations);
};
