import { partition } from "lodash-es";

import { type WorldFriend } from "~/types";
import { type EncouragementFriend, type Friend } from "~/types";

export const useWorldFriends = () => {
  const { data, ...swrResponse } = useRouteSWR<{ friends: WorldFriend[] }>(
    routes.worldFriends.index,
    {
      descriptor: "load friends",
      keepPreviousData: true,
    },
  );
  const { friends: allFriends } = data ?? {};
  const [notifiableFriends, unnotifiableFriends] = useMemo(
    () => partition(allFriends, friend => friend.notifiable),
    [allFriends],
  );
  return {
    allFriends,
    notifiableFriends,
    unnotifiableFriends,
    ...swrResponse,
  };
};

export const prettyName = (friend: Friend | EncouragementFriend): string => {
  const { emoji, name } = friend;
  return [emoji, name].filter(Boolean).join(" ");
};
