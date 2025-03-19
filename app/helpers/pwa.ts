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
  useEffect(() => {
    if (
      isStandalone &&
      visibility === "visible" &&
      "clearAppBadge" in navigator
    ) {
      void navigator.clearAppBadge();
    }
  }, [isStandalone, visibility]);
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
