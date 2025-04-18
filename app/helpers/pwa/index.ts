export const useIsStandalone = (): boolean | undefined => {
  const [isStandalone, setIsStandalone] = useState<boolean | undefined>(
    undefined,
  );
  useEffect(() => {
    if (typeof isStandalone !== "undefined") {
      return;
    }
    const { referrer } = document;
    const isLocalReferral = referrer
      ? referrer.startsWith(location.origin)
      : false;
    if (isLocalReferral) {
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
