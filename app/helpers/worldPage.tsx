import { useNetwork } from "@mantine/hooks";
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
  type WorldFriend,
  type WorldPost,
} from "~/types";

import { POST_TYPE_TO_LABEL } from "./posts";

export const useWorldActivities = (options?: SWRConfiguration) => {
  const { data, ...swrResponse } = useRouteSWR<{
    activities: Activity[];
    activityTemplates: ActivityTemplate[];
  }>(routes.worldActivities.index, {
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
  friends: WorldFriend[];
}

export const useWorldFriends = (
  options?: SWRConfiguration<WorldFriendsData>,
) => {
  const { data, ...swrResponse } = useRouteSWR<WorldFriendsData>(
    routes.worldFriends.index,
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

export const mutateWorldTimeline = async (): Promise<void> => {
  await mutate(
    key => {
      if (typeof key !== "string") {
        return false;
      }
      const url = hrefToUrl(key);
      return url.pathname === routes.world.timeline.path();
    },
    undefined,
    { revalidate: true },
  );
};

export interface WorldPostsData {
  posts: WorldPost[];
  pagination: { next: string | number | null };
}

interface WorldPostsGetKeyOptions {
  type?: PostType | null;
  date?: string | null;
  searchQuery?: string;
}

const worldPostsGetKey = (
  options?: WorldPostsGetKeyOptions,
): SWRInfiniteKeyLoader<WorldPostsData> => {
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
    return routes.worldPosts.index.path({ query });
  };
};

export interface WorldPostsOptions
  extends SWRInfiniteConfiguration<WorldPostsData> {
  type?: PostType | null;
  date?: string | null;
  searchQuery?: string;
}

export const useWorldPosts = (options?: WorldPostsOptions) => {
  const { online } = useNetwork();
  const { ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<WorldPostsData>(
    worldPostsGetKey(options),
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
export const mutateWorldPosts = async (): Promise<void> => {
  const postsPath = routes.worldPosts.index.path();
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
        return routes.worldPosts.index.path({ query });
      };
      mutations.push(mutate(unstable_serialize(getKey)));
    }
  }
  await Promise.all(mutations);
};

export interface NewPostModalOptions {
  postType: PostType;
  encouragement?: Encouragement;
  onPostCreated?: (post: WorldPost) => void;
}

export const openNewPostModal = ({
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
