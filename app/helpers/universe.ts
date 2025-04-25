import { useNetwork } from "@mantine/hooks";
import { mutate } from "swr";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import { openUrlInMobileSafari } from "./browsers";
import { type PostsData } from "./posts";

export interface UniversePostsOptions
  extends SWRInfiniteConfiguration<PostsData> {
  limit?: number;
}

const universePostsGetKey = (): SWRInfiniteKeyLoader<PostsData> => {
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
  const { data, ...swrResponse } = useSWRInfinite<PostsData>(
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
