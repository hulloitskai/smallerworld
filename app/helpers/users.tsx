import { useNetwork } from "@mantine/hooks";
import { mutate } from "swr";
import { cache } from "swr/_internal";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import { type UserPost } from "~/types";

export const USER_ICON_RADIUS_RATIO = 4.5;

export interface UserPostsData {
  posts: UserPost[];
  pagination: { next: string | null };
}

interface UserPostsGetKeyOptions {
  friendAccessToken?: string;
  date?: string | null;
}

const userPostsGetKey = (
  userId: string,
  options?: UserPostsGetKeyOptions,
): SWRInfiniteKeyLoader<UserPostsData> => {
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
    return routes.userPosts.index.path({ user_id: userId, query });
  };
};

export interface UserPostsOptions
  extends SWRInfiniteConfiguration<UserPostsData> {
  date?: string | null;
}

export const useUserPosts = (userId: string, options?: UserPostsOptions) => {
  const currentFriend = useCurrentFriend();
  const { online } = useNetwork();
  const { date, ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<UserPostsData>(
    userPostsGetKey(userId, {
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

export const mutateUserPagePosts = async (userId: string): Promise<void> => {
  const postsPath = routes.userPosts.index.path({ user_id: userId });
  const mutations: Promise<void>[] = [];
  for (const path of cache.keys()) {
    const url = hrefToUrl(path);
    if (url.pathname === postsPath) {
      const getKey: SWRInfiniteKeyLoader<UserPostsData> = (
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
        return routes.userPosts.index.path({ user_id: userId, query });
      };
      mutations.push(mutate(unstable_serialize(getKey)));
    }
  }
  await Promise.all(mutations);
};

export const mutateUserTimeline = async (userId: string): Promise<void> => {
  await mutate(
    key => {
      if (typeof key !== "string") {
        return false;
      }
      const url = hrefToUrl(key);
      return url.pathname === routes.users.timeline.path({ id: userId });
    },
    undefined,
    { revalidate: true },
  );
};
