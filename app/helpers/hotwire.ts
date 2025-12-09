export const setupTurbo = (): void => {
  void import("@hotwired/turbo").then(() => {
    if (!isHotwireNative()) {
      // @ts-expect-error - Bad TS types
      Turbo.session.drive = false;
    }
  });
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
