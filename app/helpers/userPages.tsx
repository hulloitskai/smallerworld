import { useNetwork } from "@mantine/hooks";
import { mutate } from "swr";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import { type PostsData } from "./posts";

const userPagePostsGetKey = (
  userId: string,
  friendAccessToken?: string,
  limit?: number,
): SWRInfiniteKeyLoader<PostsData> => {
  return (index, previousPageData): string | null => {
    const query: Record<string, any> = { limit: limit ?? 5 };
    if (previousPageData) {
      const { next } = previousPageData.pagination;
      if (!next) {
        return null;
      }
      query.page = next;
    }
    return routes.users.posts.path({
      id: userId,
      query: {
        friend_token: friendAccessToken,
        limit,
      },
    });
  };
};

export interface UserPagePostsOptions
  extends SWRInfiniteConfiguration<PostsData> {
  limit?: number;
}

export const useUserPagePosts = (
  userId: string,
  options?: UserPagePostsOptions,
) => {
  const currentFriend = useCurrentFriend();
  const { online } = useNetwork();
  const { limit, ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<PostsData>(
    userPagePostsGetKey(userId, currentFriend?.access_token, limit),
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

export const mutateUserPagePosts = (
  userId: string,
  friendAccessToken: string,
  limit?: number,
) => {
  void mutate(
    unstable_serialize(userPagePostsGetKey(userId, friendAccessToken, limit)),
  );
};
