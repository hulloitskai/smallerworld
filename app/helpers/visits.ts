import { useDocumentVisibility } from "@mantine/hooks";

import { currentTimeZone } from "./time";

export const useTrackVisit = (): void => {
  const visibility = useDocumentVisibility();
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();
  const params = currentFriend
    ? { query: { friend_token: currentFriend.access_token } }
    : currentUser
      ? {}
      : null;
  const { trigger } = useRouteMutation<{}>(routes.visits.track, {
    descriptor: "track visit",
    params,
    failSilently: true,
  });
  useEffect(() => {
    if (!params) {
      return;
    }
    if (visibility !== "visible") {
      return;
    }
    const timeout = setTimeout(() => {
      void trigger({
        visit: {
          time_zone: currentTimeZone(),
        },
      });
      if ("clearAppBadge" in navigator) {
        void navigator.clearAppBadge();
      }
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [visibility]); // eslint-disable-line react-hooks/exhaustive-deps
};
