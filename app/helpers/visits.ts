import { useDocumentVisibility } from "@mantine/hooks";

export const useTrackVisit = (): void => {
  const isStandalone = useIsStandalone();
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
    if (
      params &&
      typeof isStandalone === "boolean" &&
      visibility === "visible"
    ) {
      const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
      void trigger({
        visit: {
          clear_notifications: isStandalone,
          time_zone_name: timeZone,
        },
      });
      if ("clearAppBadge" in navigator) {
        void navigator.clearAppBadge();
      }
    }
  }, [isStandalone, visibility]); // eslint-disable-line react-hooks/exhaustive-deps
};
