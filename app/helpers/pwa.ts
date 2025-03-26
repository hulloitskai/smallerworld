import { useDocumentVisibility, useMediaQuery } from "@mantine/hooks";
import { useMounted } from "@mantine/hooks";

export const useIsStandalone = (): boolean | undefined => {
  const mounted = useMounted();
  const isStandalone = useMediaQuery("(display-mode: standalone)");
  if (mounted) {
    return isStandalone;
  }
};

const useInstallPromptEvent = ():
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

export interface InstallPromptReturn {
  installing: boolean;
  install: (() => Promise<void>) | null | undefined;
  error: Error | undefined;
}

export const useInstallPrompt = (): InstallPromptReturn => {
  const installPromptEvent = useInstallPromptEvent();
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const install = useMemo<(() => Promise<void>) | null | undefined>(() => {
    if (installPromptEvent) {
      return () => {
        setInstalling(true);
        return installPromptEvent
          .prompt()
          .catch(error => {
            console.error("failed to install to home screen", error);
            if (error instanceof Error) {
              setError(error);
              toast.error("failed to install to home screen", {
                description: error.message,
              });
            }
          })
          .finally(() => {
            setInstalling(false);
          });
      };
    }
    return installPromptEvent;
  }, [installPromptEvent]);
  return {
    installing,
    install,
    error,
  };
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
