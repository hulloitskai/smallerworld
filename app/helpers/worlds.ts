import { hrefToUrl } from "@inertiajs/core";
import { useNetwork } from "@mantine/hooks";
import { last } from "lodash-es";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { mutate } from "swr";
import { cache } from "swr/_internal";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import { type Encouragement, type WorldPost, type WorldProfile } from "~/types";

import { useCurrentFriend } from "./authentication";
import routes from "./routes";
import { fetchRoute } from "./routes/fetch";

export interface WorldPageProps extends SharedPageProps {
  world: WorldProfile;
  replyToNumber: string | null;
  lastSentEncouragement: Encouragement | null;
  invitationRequested: boolean;
}

export const WORLD_ICON_RADIUS_RATIO = 4.5;

export interface WorldPostsData {
  posts: WorldPost[];
  pagination: { next: string | null };
}

interface WorldPostsGetKeyOptions {
  friendAccessToken?: string;
  date?: string | null;
}

const worldPostsGetKey = (
  worldId: string,
  options?: WorldPostsGetKeyOptions,
): SWRInfiniteKeyLoader<WorldPostsData> => {
  return (index, previousPageData): string | null => {
    const query: Record<string, any> = {};
    if (options?.friendAccessToken) {
      query.friend_token = options.friendAccessToken;
    }
    if (options?.date) {
      query.date = DateTime.fromISO(options.date).toLocal().toISO();
    }
    if (previousPageData) {
      const { next } = previousPageData.pagination;
      if (!next) {
        return null;
      }
      query.page = next;
    }
    return routes.worldPosts.index.path({ world_id: worldId, query });
  };
};

export interface WorldPostsOptions
  extends SWRInfiniteConfiguration<WorldPostsData> {
  date?: string | null;
}

export const useWorldPosts = (worldId: string, options?: WorldPostsOptions) => {
  const currentFriend = useCurrentFriend();
  const { online } = useNetwork();
  const { date, ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<WorldPostsData>(
    worldPostsGetKey(worldId, {
      friendAccessToken: currentFriend?.access_token,
      date: date ?? null,
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
      return lastPage ? typeof lastPage.pagination.next === "string" : false;
    }
  }, [data]);
  return { posts, hasMorePosts, ...swrResponse };
};

export const mutateWorldPosts = async (worldId: string): Promise<void> => {
  const postsPath = routes.worldPosts.index.path({ world_id: worldId });
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
        return routes.worldPosts.index.path({ world_id: worldId, query });
      };
      mutations.push(mutate(unstable_serialize(getKey)));
    }
  }
  await Promise.all(mutations);
};

export const mutateWorldTimeline = async (worldId: string): Promise<void> => {
  await mutate(
    key => {
      if (typeof key !== "string") {
        return false;
      }
      const url = hrefToUrl(key);
      return (
        url.pathname === routes.worldTimelines.show.path({ world_id: worldId })
      );
    },
    undefined,
    { revalidate: true },
  );
};

// interface WorldPageInstallationInstructionsInMobileSafariSettings {
//   currentFriend: Friend;
//   user: UserProfile;
// }

// export const openWorldPageInstallationInstructionsInMobileSafari = ({
//   currentFriend,
//   user,
// }: WorldPageInstallationInstructionsInMobileSafariSettings) => {
//   const instructionsQuery: Record<string, string> = {
//     friend_token: currentFriend.access_token,
//     intent: "installation_instructions",
//   };
//   const { manifest_icon_type } = queryParamsFromPath(location.href);
//   if (manifest_icon_type) {
//     instructionsQuery.manifest_icon_type = manifest_icon_type;
//   }
//   const instructionsPath = routes.worlds.show.path({
//     user_id: user.id,
//     query: instructionsQuery,
//   });
//   openUrlInMobileSafari(instructionsPath);
// };
