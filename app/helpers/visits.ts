import { useDocumentVisibility } from "@mantine/hooks";

export const useTrackVisit = (): void => {
  const { isStandalone, outOfPWAScope } = usePWA();
  const visibility = useDocumentVisibility();
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();
  const params = currentFriend
    ? { query: { friend_token: currentFriend.access_token } }
    : currentUser
      ? {}
      : null;
  const { trigger } = useRouteMutation<
    {},
    { visit: { clear_notifications: boolean; time_zone_name: string } }
  >(routes.visits.track, {
    descriptor: "track visit",
    params,
    failSilently: true,
  });
  useEffect(() => {
    if (!params) {
      return;
    }
    if (typeof isStandalone !== "boolean") {
      return;
    }
    if (visibility !== "visible") {
      return;
    }
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    const timeout = setTimeout(() => {
      const clearNotifications = isStandalone && !outOfPWAScope;
      void trigger({
        visit: {
          clear_notifications: clearNotifications,
          time_zone_name: timeZone,
        },
      });
      if (clearNotifications && "clearAppBadge" in navigator) {
        void navigator.clearAppBadge();
      }
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [isStandalone, outOfPWAScope, visibility]); // eslint-disable-line react-hooks/exhaustive-deps
};
