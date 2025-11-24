import { hrefToUrl } from "@inertiajs/core";
import { useNetwork } from "@mantine/hooks";
import { last } from "lodash-es";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { mutate, type SWRConfiguration } from "swr";
import { cache } from "swr/_internal";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import PostForm from "~/components/PostForm";
import {
  type Activity,
  type ActivityTemplate,
  type Encouragement,
  type PostType,
  type User,
  type UserWorldFriendProfile,
  type UserWorldPost,
} from "~/types";

import { POST_TYPE_TO_LABEL } from "./posts";
import routes from "./routes";
import { fetchRoute } from "./routes/fetch";
import { useRouteSWR } from "./routes/swr";

export const useUserWorldActivities = (options?: SWRConfiguration) => {
  const { data, ...swrResponse } = useRouteSWR<{
    activities: Activity[];
    activityTemplates: ActivityTemplate[];
  }>(routes.userWorldActivities.index, {
    descriptor: "load activities",
    ...options,
  });
  const { activities, activityTemplates } = data ?? {};
  const activitiesAndTemplates = useMemo(
    () => [...(activities ?? []), ...(activityTemplates ?? [])],
    [activities, activityTemplates],
  );
  return {
    data,
    activities,
    activityTemplates,
    activitiesAndTemplates,
    ...swrResponse,
  };
};

interface WorldFriendsData {
  friends: UserWorldFriendProfile[];
}

export const useUserWorldFriends = (
  options?: SWRConfiguration<WorldFriendsData>,
) => {
  const { data, ...swrResponse } = useRouteSWR<WorldFriendsData>(
    routes.userWorldFriends.index,
    {
      descriptor: "load friends",
      ...options,
    },
  );
  const { friends } = data ?? {};
  return {
    data,
    friends,
    ...swrResponse,
  };
};

export interface UserWorldPostsData {
  posts: UserWorldPost[];
  pagination: { next: string | number | null };
}

interface UserWorldPostsGetKeyOptions {
  type?: PostType | null;
  date?: string | null;
  searchQuery?: string;
}

const userWorldPostsGetKey = (
  options?: UserWorldPostsGetKeyOptions,
): SWRInfiniteKeyLoader<UserWorldPostsData> => {
  return (index, previousPageData): string | null => {
    const query: Record<string, string> = {};
    if (options?.type) {
      query.type = options.type;
    }
    if (options?.date) {
      query.date = DateTime.fromISO(options.date).toLocal().toISO();
    }
    if (options?.searchQuery) {
      query.q = options.searchQuery;
    }
    if (previousPageData) {
      const { next } = previousPageData.pagination;
      if (!next) {
        return null;
      }
      query.page = next.toString();
    }
    return routes.userWorldPosts.index.path({ query });
  };
};

export interface UserWorldPostsOptions
  extends SWRInfiniteConfiguration<UserWorldPostsData> {
  type?: PostType | null;
  date?: string | null;
  searchQuery?: string;
}

export const useUserWorldPosts = (options?: UserWorldPostsOptions) => {
  const { online } = useNetwork();
  const { ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<UserWorldPostsData>(
    userWorldPostsGetKey(options),
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
export const mutateUserWorldPosts = async (): Promise<void> => {
  const postsPath = routes.userWorldPosts.index.path();
  const mutations: Promise<void>[] = [];
  for (const path of cache.keys()) {
    const url = hrefToUrl(path);
    if (url.pathname === postsPath) {
      const getKey: SWRInfiniteKeyLoader<UserWorldPostsData> = (
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
        return routes.userWorldPosts.index.path({ query });
      };
      mutations.push(mutate(unstable_serialize(getKey)));
    }
  }
  await Promise.all(mutations);
};

export interface NewPostModalOptions {
  postType: PostType;
  encouragement?: Encouragement;
  onPostCreated?: (post: UserWorldPost) => void;
}

export const openNewUserWorldPostModal = ({
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

export const worldManifestUrlForUser = (user: User): string =>
  user.supported_features.includes("new_pwa")
    ? routes.userManifest.show.path()
    : routes.userWorldManifest.show.path();
