export const isHotwireNative = (): boolean => {
  if (navigator.userAgent.includes("Hotwire Native")) {
    return true;
  }
  const { hotwire_native } = queryParamsFromPath(location.href);
  return isTruthy(hotwire_native);
};

export const useIsHotwireNative = (): boolean | undefined => {
  const [isNative, setIsNative] = useState<boolean | undefined>();
  useEffect(() => {
    setIsNative(isHotwireNative());
  }, []);
  return isNative;
};
