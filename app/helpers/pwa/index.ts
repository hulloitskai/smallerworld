import { createContext, useContext } from "react";

import { queryParamsFromPath } from "../inertia/routing";

export interface PWAState {
  freshCSRF: { param: string; token: string } | null;
  activeServiceWorker: ServiceWorker | null | undefined;
  isStandalone: boolean | undefined;
  outOfPWAScope: boolean;
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

export const getPwaScope = (): string | null => {
  const { pwa_scope: searchScope } = queryParamsFromPath(location.href);
  if (searchScope) {
    return searchScope;
  }
  const metaScope = getMeta("pwa-scope");
  if (metaScope) {
    return metaScope;
  }
  const manifestLink = document.querySelector<HTMLLinkElement>(
    "link[rel='manifest']",
  );
  if (manifestLink) {
    const manifestHref = manifestLink.href;
    const { pathname } = new URL(manifestHref, location.origin);
    const lastSlashIndex = pathname.lastIndexOf("/");
    return pathname.slice(0, lastSlashIndex);
  }
  return null;
};
