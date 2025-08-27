import { type DependencyList } from "react";

export const useShortlink = (
  resolveUrlOrPath: () => string,
  deps: DependencyList,
): string | undefined => {
  const [url, setUrl] = useState<string>();
  useEffect(
    () => {
      const url = hrefToUrl(resolveUrlOrPath());
      shortlinkIfAvailable(url);
      setUrl(url.toString());
    },
    deps, // eslint-disable-line react-hooks/exhaustive-deps
  );
  return url;
};

export const shortlinkIfAvailable = (url: URL): void => {
  if (url.hostname === "smallerworld.club") {
    url.hostname = "smlr.world";
  }
};
