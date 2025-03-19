import { useNetwork } from "@mantine/hooks";
import { type SVGProps } from "react";
import { mutate } from "swr";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import JournalEntryIcon from "~icons/basil/book-solid";
import InvitationIcon from "~icons/heroicons/envelope-open-20-solid";
import PoemIcon from "~icons/heroicons/pencil-20-solid";
import QuestionIcon from "~icons/heroicons/question-mark-circle-20-solid";

import { type Post, type PostType, type PostVisibility } from "~/types";

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
  // "chosen_family",
];

export const POST_TYPE_TO_ICON: Record<
  PostType,
  FC<SVGProps<SVGSVGElement>>
> = {
  journal_entry: JournalEntryIcon,
  poem: PoemIcon,
  invitation: InvitationIcon,
  question: QuestionIcon,
};

export const POST_VISIBILITY_TO_ICON: Record<
  PostVisibility,
  FC<SVGProps<SVGSVGElement>>
> = {
  public: PublicIcon,
  friends: FriendsIcon,
  chosen_family: ChosenFamilyIcon,
};

export interface PostsData {
  posts: Post[];
  pagination: { next: string | null };
}

const postsGetKey = (limit?: number): SWRInfiniteKeyLoader<PostsData> => {
  return (index, previousPageData): string | null => {
    const query: Record<string, any> = { limit: limit ?? 5 };
    if (previousPageData) {
      const { next } = previousPageData.pagination;
      if (!next) {
        return null;
      }
      query.page = next;
    }
    return routes.posts.index.path({
      query: {
        limit,
      },
    });
  };
};

export interface PostsOptions extends SWRInfiniteConfiguration<PostsData> {
  limit?: number;
}

export const usePosts = (options?: PostsOptions) => {
  const { online } = useNetwork();
  const { limit, ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<PostsData>(
    postsGetKey(limit),
    (path: string) => fetchRoute(path, { descriptor: "load posts" }),
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
      return lastPage ? typeof lastPage.pagination.next === "string" : false;
    }
  }, [data]);
  return { posts, hasMorePosts, ...swrResponse };
};

export const mutatePosts = (limit?: number) => {
  void mutate(unstable_serialize(postsGetKey(limit)));
};
