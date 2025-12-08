export const setupTurbo = (): void => {
  void import("@hotwired/turbo");
};

export const isHotwireNative = (): boolean => {
  return navigator.userAgent.includes("Hotwire Native");
};

export const useIsHotwireNative = (): boolean | undefined => {
  const [isNative, setIsNative] = useState<boolean | undefined>();
  useEffect(() => {
    setIsNative(isHotwireNative());
  }, []);
  return isNative;
};
