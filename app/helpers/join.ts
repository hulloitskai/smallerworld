import { useEffect, useState } from "react";

import { type Friend, type User } from "~/types";

export const formatJoinMessage = (joinUrl: string) =>
  `you're invited to join my smaller world: ${joinUrl}`;

const buildJoinUrl = (user: User, friend: Friend): string => {
  const joinPath = routes.users.show.path({
    id: user.handle,
    query: {
      friend_token: friend.access_token,
      intent: "join",
    },
  });
  const joinUrl = hrefToUrl(joinPath);
  return joinUrl.toString();
};

export const useJoinUrl = (user: User, friend: Friend): string | undefined => {
  const [joinUrl, setJoinUrl] = useState<string>();
  useEffect(() => {
    setJoinUrl(buildJoinUrl(user, friend));
  }, [user, friend]);
  return joinUrl;
};
