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
    setTimeout(() => {
      if (!matchMedia("(display-mode: standalone)").matches) {
        return;
      }
      if (document.visibilityState === "hidden") {
        return;
      }
      void trigger({
        visit: {
          clear_notifications: isStandalone,
          time_zone_name: timeZone,
        },
      });
      if ("clearAppBadge" in navigator) {
        void navigator.clearAppBadge();
      }
    }, 1000);
  }, [isStandalone, visibility]); // eslint-disable-line react-hooks/exhaustive-deps
};
