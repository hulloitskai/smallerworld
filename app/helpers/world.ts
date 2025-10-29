import { type SWRConfiguration } from "swr";

import {
  type Activity,
  type ActivityTemplate,
  type WorldFriend,
} from "~/types";

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
