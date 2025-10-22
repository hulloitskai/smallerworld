import { useNetwork } from "@mantine/hooks";
import { createContext, useContext } from "react";
import { mutate } from "swr";
import useSWRInfinite, {
  type SWRInfiniteConfiguration,
  type SWRInfiniteKeyLoader,
  unstable_serialize,
} from "swr/infinite";

import { type Friend, type UserPost, type UserProfile } from "~/types";

import { openUrlInMobileSafari } from "./browsers";
import { queryParamsFromPath } from "./inertia/routing";

export const USER_ICON_RADIUS_RATIO = 4.5;

export interface UserPagePostsData {
  posts: UserPost[];
  pagination: { next: string | null };
}

const userPagePostsGetKey = (
  userId: string,
  friendAccessToken?: string,
): SWRInfiniteKeyLoader<UserPagePostsData> => {
  return (index, previousPageData): string | null => {
    const query: Record<string, any> = {
      friend_token: friendAccessToken,
    };
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

export interface UserPagePostsOptions
  extends SWRInfiniteConfiguration<UserPagePostsData> {}

export const useUserPagePosts = (
  userId: string,
  options?: UserPagePostsOptions,
) => {
  const currentFriend = useCurrentFriend();
  const { online } = useNetwork();
  const { ...swrConfiguration } = options ?? {};
  const { data, ...swrResponse } = useSWRInfinite<UserPagePostsData>(
    userPagePostsGetKey(userId, currentFriend?.access_token),
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
  friendAccessToken?: string,
) => {
  void mutate(
    unstable_serialize(userPagePostsGetKey(userId, friendAccessToken)),
  );
};

export interface UserPageDialogState {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

export const UserPageDialogStateContext = createContext<
  UserPageDialogState | undefined
>(undefined);

const useUserPageDialogState = (): UserPageDialogState => {
  const state = useContext(UserPageDialogStateContext);
  if (!state) {
    throw new Error(
      "useUserPageDialogState must be used within a UserPageDialogStateProvider",
    );
  }
  return state;
};

export const useUserPageDialogOpened = (opened?: boolean): boolean => {
  const state = useUserPageDialogState();
  useEffect(() => {
    if (typeof opened === "boolean") {
      state.setOpened(opened);
    }
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps
  return state.opened;
};

interface UserPageInstallationInstructionsInMobileSafariSettings {
  currentFriend: Friend;
  user: UserProfile;
}

export const openUserPageInstallationInstructionsInMobileSafari = ({
  currentFriend,
  user,
}: UserPageInstallationInstructionsInMobileSafariSettings) => {
  const instructionsQuery: Record<string, string> = {
    friend_token: currentFriend.access_token,
    intent: "installation_instructions",
  };
  const { manifest_icon_type } = queryParamsFromPath(location.href);
  if (manifest_icon_type) {
    instructionsQuery.manifest_icon_type = manifest_icon_type;
  }
  const instructionsPath = routes.users.show.path({
    id: user.handle,
    query: instructionsQuery,
  });
  openUrlInMobileSafari(instructionsPath);
};
