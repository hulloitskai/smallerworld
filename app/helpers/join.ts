import { useEffect, useState } from "react";

import { type Friend, type User } from "~/types";

export const formatJoinMessage = (joinUrl: string) =>
  `you're invited to join my smaller world: ${joinUrl}`;

const buildJoinUrl = (user: User, friend: Friend): string => {
  const joinPath = routes.users.show.path({
    handle: user.handle,
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

export const shareOrCopyJoinUrl = (user: User, friend: Friend) => {
  const joinUrl = buildJoinUrl(user, friend);
  const shareData: ShareData = {
    title: formatJoinMessage(joinUrl),
    url: joinUrl,
  };
  if (navigator.canShare(shareData)) {
    void navigator.share(shareData);
  } else {
    void navigator.clipboard.writeText(joinUrl).then(() => {
      toast.success("invite link copied!");
    });
  }
};
