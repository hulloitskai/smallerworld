import { hrefToUrl } from "@inertiajs/core";
import { useNetwork } from "@mantine/hooks";
import { last } from "lodash-es";
import { useMemo } from "react";
import { mutate } from "swr";
import { cache } from "swr/_internal";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import { type SpacePost } from "~/types";

import routes from "./routes";
import { fetchRoute } from "./routes/fetch";

export interface SpacePostsData {
  posts: SpacePost[];
  pagination: { next: number | string | null };
}

interface SpacePostsGetKeyOptions {
  type?: string | null;
  searchQuery?: string | null;
}

const spacePostsGetKey = (
  spaceId: string,
  options?: SpacePostsGetKeyOptions,
): SWRInfiniteKeyLoader<SpacePostsData> => {
  return (index, previousPageData): string | null => {
    const query: Record<string, any> = {};
    if (options?.type) {
      query.type = options.type;
    }
    if (options?.searchQuery !== undefined && options.searchQuery !== null) {
      query.q = options.searchQuery;
    }
    if (previousPageData) {
      const { next } = previousPageData.pagination;
      if (!next) {
        return null;
      }
      query.page = next.toString();
    }
    return routes.spacePosts.index.path({ space_id: spaceId, query });
  };
};

export interface SpacePostsOptions
  extends SWRInfiniteConfiguration<SpacePostsData> {
  type?: string | null;
  searchQuery?: string | null;
}

export const useSpacePosts = (spaceId: string, options?: SpacePostsOptions) => {
  const { online } = useNetwork();
  const { type, searchQuery, ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<SpacePostsData>(
    spacePostsGetKey(spaceId, {
      type: type ?? null,
      searchQuery: searchQuery ?? null,
    }),
    (path: string) =>
      fetchRoute(path, {
        descriptor: "load posts",
      }),
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
      if (!lastPage) {
        return false;
      }
      const { next } = lastPage.pagination;
      return typeof next === "string" || typeof next === "number";
    }
  }, [data]);
  return { posts, hasMorePosts, ...swrResponse };
};

export const mutateSpacePosts = async (spaceId: string): Promise<void> => {
  const postsPath = routes.spacePosts.index.path({ space_id: spaceId });
  const mutations: Promise<void>[] = [];
  for (const path of cache.keys()) {
    const url = hrefToUrl(path);
    if (url.pathname === postsPath) {
      const getKey: SWRInfiniteKeyLoader<SpacePostsData> = (
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
        return routes.spacePosts.index.path({ space_id: spaceId, query });
      };
      mutations.push(mutate(unstable_serialize(getKey)));
    }
  }
  await Promise.all(mutations);
};
