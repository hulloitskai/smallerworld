import { useDocumentVisibility, useMediaQuery } from "@mantine/hooks";
import { useMounted } from "@mantine/hooks";

import { isIosSafari } from "./browserDetection";

export const useIsStandalone = (): boolean | undefined => {
  const mounted = useMounted();
  const isStandalone = useMediaQuery("(display-mode: standalone)");
  if (mounted) {
    return isStandalone;
  }
};

export const useInstallPromptEvent = ():
  | BeforeInstallPromptEvent
  | undefined
  | null => {
  const [event, setEvent] = useState<
    BeforeInstallPromptEvent | undefined | null
  >();
  useEffect(() => {
    const capturedEvent = window.installPromptEvent;
    setEvent(capturedEvent ?? null);
    const listener = (event: Event) => {
      event.preventDefault();
      setEvent(event as BeforeInstallPromptEvent);
    };
    addEventListener("beforeinstallprompt", listener);
    return () => {
      removeEventListener("beforeinstallprompt", listener);
    };
  }, []);
  return event;
};

export const useClearAppBadge = () => {
  const isStandalone = useIsStandalone();
  const visibility = useDocumentVisibility();
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();
  const clearNotificationParams = currentFriend
    ? { query: { friend_token: currentFriend.access_token } }
    : currentUser
      ? {}
      : null;
  const { trigger } = useRouteMutation(routes.notifications.cleared, {
    descriptor: "mark notifications as cleared",
    params: clearNotificationParams,
    failSilently: true,
    onSuccess: () => {
      console.info("notifications cleared");
    },
  });
  useEffect(() => {
    if (
      isStandalone &&
      visibility === "visible" &&
      "clearAppBadge" in navigator
    ) {
      void navigator.clearAppBadge();
      if (clearNotificationParams) {
        void trigger();
      }
    }
  }, [isStandalone, visibility]); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useIsInstallable = (
  installEvent: Event | null | undefined,
): boolean | undefined => {
  const [isInstallable, setIsInstallable] = useState<boolean | undefined>(() =>
    installEvent ? true : undefined,
  );
  useEffect(() => {
    setIsInstallable(!!installEvent || isIosSafari());
  }, [installEvent]);
  return isInstallable;
};
