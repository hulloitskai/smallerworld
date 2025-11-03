import { useNetwork } from "@mantine/hooks";
import { mutate } from "swr";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import { type LocalUniversePost } from "~/types";

export interface LocalUniversePostsData {
  posts: LocalUniversePost[];
  pagination: { next: string | null };
}

export interface LocalUniversePostsOptions
  extends SWRInfiniteConfiguration<LocalUniversePostsData> {}

const localUniversePostsGetKey =
  (): SWRInfiniteKeyLoader<LocalUniversePostsData> => {
    return (index, previousPageData): string | null => {
      const query: Record<string, any> = {};
      if (previousPageData) {
        const { next } = previousPageData.pagination;
        if (!next) {
          return null;
        }
        query.page = next;
      }
      return routes.localUniversePosts.index.path({ query });
    };
  };

export const useLocalUniversePosts = (options?: LocalUniversePostsOptions) => {
  const { online } = useNetwork();
  const { ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<LocalUniversePostsData>(
    localUniversePostsGetKey(),
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

export const mutateLocalUniversePosts = () => {
  void mutate(unstable_serialize(localUniversePostsGetKey()));
};
