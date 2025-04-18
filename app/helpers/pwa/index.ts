export const useIsStandalone = (): boolean | undefined => {
  const [isStandalone, setIsStandalone] = useState<boolean | undefined>(
    undefined,
  );
  useEffect(() => {
    if (typeof isStandalone !== "undefined") {
      return;
    }
    if (referrerIsOutOfScope()) {
      setIsStandalone(false);
      return;
    }
    const mediaMatch = matchMedia("(display-mode: standalone)");
    setIsStandalone(mediaMatch.matches);
    const onChange = (event: MediaQueryListEvent): void => {
      setIsStandalone(event.matches);
    };
    mediaMatch.addEventListener("change", onChange);
    return () => {
      mediaMatch.removeEventListener("change", onChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return isStandalone;
};

const referrerIsOutOfScope = (): boolean => {
  const manifestLink = document.querySelector<HTMLLinkElement>(
    "link[rel='manifest']",
  );
  if (!manifestLink) {
    return false;
  }
  const manifestScope = manifestScopeFromHref(manifestLink.href);
  const { referrer } = document;
  return !!referrer && !referrer.startsWith(manifestScope);
};

const manifestScopeFromHref = (href: string): string => {
  const lastSlashIndex = href.lastIndexOf("/");
  return href.slice(0, lastSlashIndex);
};
