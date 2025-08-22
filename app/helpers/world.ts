import { partition } from "lodash-es";
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

export const useWorldFriends = (options?: SWRConfiguration) => {
  const { data, ...swrResponse } = useRouteSWR<{ friends: WorldFriend[] }>(
    routes.worldFriends.index,
    {
      descriptor: "load friends",
      ...options,
    },
  );
  const { friends: allFriends } = data ?? {};
  const [notifiableFriends, unnotifiableFriends] = useMemo(
    () => partition(allFriends, friend => friend.notifiable),
    [allFriends],
  );
  return {
    data,
    allFriends,
    notifiableFriends,
    unnotifiableFriends,
    ...swrResponse,
  };
};
