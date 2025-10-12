import { useDocumentVisibility } from "@mantine/hooks";
import { createContext, useContext } from "react";

import { type PageCSRF } from "~/types";

import { reloadCSRF } from "./csrf";
import { queryParamsFromPath } from "./inertia/routing";
import { resetSWRCache } from "./routes/swr";

export interface PWAState {
  freshCSRF: { param: string; token: string } | null;
  activeServiceWorker: ServiceWorker | null | undefined;
  isStandalone: boolean | undefined;
  outOfPWAScope: boolean;
  installing: boolean;
  install: (() => Promise<void>) | null | undefined;
  installError: Error | undefined;
}

export const PWAContext = createContext<PWAState | undefined>(undefined);

export const usePWA = (): PWAState => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
};

export const useIsStandalone = (): boolean | undefined => {
  const [isStandalone, setIsStandalone] = useState<boolean | undefined>(
    undefined,
  );
  useEffect(() => {
    if (isStandalone !== undefined) {
      return;
    }
    const mediaMatch = matchMedia("(display-mode: standalone)");
    setIsStandalone(mediaMatch.matches);
    const listener = (event: MediaQueryListEvent): void => {
      setIsStandalone(event.matches);
    };
    mediaMatch.addEventListener("change", listener);
    return () => {
      mediaMatch.removeEventListener("change", listener);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return isStandalone;
};

export const useOutOfPWAScope = (): boolean => {
  const { url } = usePage();
  return useMemo(() => {
    const { pwa_scope: pwaScope } = queryParamsFromPath(url);
    if (pwaScope) {
      return !url.startsWith(pwaScope);
    }
    return false;
  }, [url]);
};

export const getPWAScope = (): string | null => getMeta("pwa-scope") ?? null;

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

export interface InstallPWAResult {
  installing: boolean;
  install: (() => Promise<void>) | null | undefined;
  error: Error | undefined;
}

export const useInstallPWA = (): InstallPWAResult => {
  const installPromptEvent = useInstallPromptEvent();
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const install = useMemo<(() => Promise<void>) | null | undefined>(() => {
    if (installPromptEvent) {
      return () => {
        console.info("Installing PWA");
        setInstalling(true);
        const standaloneQuery = matchMedia("(display-mode: standalone)");
        const handleDisplayModeChange = (event: MediaQueryListEvent) => {
          if (event.matches) {
            const url = hrefToUrl(location.href);
            for (const key of url.searchParams.keys()) {
              if (!["friend_token", "pwa_scope"].includes(key)) {
                url.searchParams.delete(key);
              }
            }
            router.visit(url.toString());
          }
        };
        standaloneQuery.addEventListener("change", handleDisplayModeChange);
        return installPromptEvent
          .prompt()
          .then(
            async () => {
              const { outcome } = await installPromptEvent.userChoice;
              if (outcome === "accepted") {
                console.info("PWA installation triggered");
                toast.success("app installation started");
              }
            },
            reason => {
              console.error("Failed to install PWA", reason);
              if (reason instanceof Error) {
                setError(reason);
                toast.error("failed to install app", {
                  description: reason.message,
                });
              }
            },
          )
          .finally(() => {
            setInstalling(false);
            standaloneQuery.removeEventListener(
              "change",
              handleDisplayModeChange,
            );
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

export const useFreshCSRF = (): PageCSRF | null => {
  const pageProps = usePageProps();
  const [freshCSRF, setFreshCSRF] = useState<PageCSRF | null>(
    () => pageProps.csrf,
  );
  const visibility = useDocumentVisibility();
  useDidUpdate(() => {
    if (visibility === "hidden") {
      setFreshCSRF(null);
    } else if (visibility === "visible") {
      void reloadCSRF().then(csrf => {
        setFreshCSRF(csrf);
        return resetSWRCache();
      });
    }
  }, [visibility]);
  return freshCSRF;
};
