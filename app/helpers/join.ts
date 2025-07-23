import { type Friend, type User } from "~/types";

const JOIN_MESSAGE = "you're invited to join my smaller world";

export const formatJoinInvitation = (joinUrl: string) =>
  `${JOIN_MESSAGE}: ${joinUrl}`;

export const useJoinUrl = (user: User, friend: Friend): string | undefined =>
  useNormalizeUrl(
    () =>
      routes.users.show.path({
        id: user.handle,
        query: {
          friend_token: friend.access_token,
          intent: "join",
        },
      }),
    [user.handle, friend.access_token],
  );

export const useJoinShareData = (
  joinUrl: string | undefined,
): ShareData | undefined =>
  useMemo(() => {
    if (!joinUrl) {
      return;
    }
    const shareData: ShareData = {
      text: JOIN_MESSAGE,
      url: joinUrl,
    };
    if (navigator.canShare(shareData)) {
      return shareData;
    }
  }, [joinUrl]);
