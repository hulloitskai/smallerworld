import { useNetwork } from "@mantine/hooks";
import { mutate } from "swr";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import { type UniversePost } from "~/types";

import { openUrlInMobileSafari } from "./browsers";

export interface UniversePostsData {
  posts: UniversePost[];
  pagination: { next: string | null };
}

export interface UniversePostsOptions
  extends SWRInfiniteConfiguration<UniversePostsData> {}

const universePostsGetKey = (): SWRInfiniteKeyLoader<UniversePostsData> => {
  return (index, previousPageData): string | null => {
    const query: Record<string, any> = {};
    if (previousPageData) {
      const { next } = previousPageData.pagination;
      if (!next) {
        return null;
      }
      query.page = next;
    }
    return routes.universePosts.index.path({ query });
  };
};

export const useUniversePosts = (options?: UniversePostsOptions) => {
  const { online } = useNetwork();
  const { ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<UniversePostsData>(
    universePostsGetKey(),
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

export const mutateUniversePosts = () => {
  void mutate(unstable_serialize(universePostsGetKey()));
};

export const openUniverseInstallationInstructionsInMobileSafari = () => {
  const universeUrl = routes.universe.show.path({
    query: {
      intent: "installation_instructions",
    },
  });
  openUrlInMobileSafari(universeUrl);
};
