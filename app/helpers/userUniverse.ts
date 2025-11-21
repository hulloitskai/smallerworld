import { useNetwork } from "@mantine/hooks";
import { mutate } from "swr";
import { cache } from "swr/_internal";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import { type UserUniversePost } from "~/types";

export interface UserUniversePostsData {
  posts: UserUniversePost[];
  pagination: { next: string | null };
}

export interface UserUniversePostsOptions
  extends SWRInfiniteConfiguration<UserUniversePostsData> {}

const userUniversePostsGetKey =
  (): SWRInfiniteKeyLoader<UserUniversePostsData> => {
    return (index, previousPageData): string | null => {
      const query: Record<string, any> = {};
      if (previousPageData) {
        const { next } = previousPageData.pagination;
        if (!next) {
          return null;
        }
        query.page = next;
      }
      return routes.userUniverse.posts.path({ query });
    };
  };

export const useUserUniversePosts = (options?: UserUniversePostsOptions) => {
  const { online } = useNetwork();
  const { ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<UserUniversePostsData>(
    userUniversePostsGetKey(),
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

export const mutateUserUniversePosts = async (): Promise<void> => {
  const postsPath = routes.userUniverse.posts.path();
  const mutations: Promise<void>[] = [];
  for (const path of cache.keys()) {
    const url = hrefToUrl(path);
    if (url.pathname === postsPath) {
      const getKey: SWRInfiniteKeyLoader<UserUniversePostsData> = (
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
        return routes.userUniverse.posts.path({ query });
      };
      mutations.push(mutate(unstable_serialize(getKey)));
    }
  }
  await Promise.all(mutations);
};
