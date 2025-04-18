export const useIsStandalone = (): boolean | undefined => {
  const [isStandalone, setIsStandalone] = useState<boolean | undefined>(
    undefined,
  );
  useEffect(() => {
    if (typeof isStandalone !== "undefined") {
      return;
    }
    if (hasNonLocalReferrer()) {
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

const hasNonLocalReferrer = (): boolean => {
  const { referrer } = document;
  const normalizedReferrer = referrer === "null" ? "" : normalizedUrl(referrer);
  const normalizedLocation = normalizedUrl(location.href);
  return normalizedReferrer !== normalizedLocation;
};

const normalizedUrl = (urlString: string): string => {
  const url = new URL(urlString);
  url.searchParams.forEach((value, key) => {
    if (key !== "friend_token") {
      url.searchParams.delete(key);
    }
  });
  return url.toString();
};
