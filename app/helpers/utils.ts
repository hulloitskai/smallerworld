import { type DependencyList } from "react";

const TRUTHY_VALUES = ["1", "true", "t"];

export const isTruthy = (value: any): boolean => {
  switch (typeof value) {
    case "string":
      return TRUTHY_VALUES.includes(value.toLowerCase());
    case "number":
      return Number.isFinite(value) && value > 0;
    case "boolean":
      return value;
    default:
      return false;
  }
};

export const resolve = <T>(f: () => T): T => f();

export const normalizeUrl = (urlOrPath: string): string =>
  hrefToUrl(urlOrPath).toString();

export const useNormalizeUrl = (
  resolveUrlOrPath: () => string,
  deps: DependencyList,
): string | undefined => {
  const [url, setUrl] = useState<string>();
  useEffect(
    () => {
      setUrl(normalizeUrl(resolveUrlOrPath()));
    },
    deps, // eslint-disable-line react-hooks/exhaustive-deps
  );
  return url;
};
