import { count } from "@wordpress/wordcount";
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

export const readingTimeFor = (text: string, wpm = 150) => {
  const wordCount = count(text, "words");
  return (wordCount / wpm) * 60 * 1000;
};

const stripQuery = (href: string): string => {
  const url = hrefToUrl(href);
  url.search = "";
  return url.toString();
};

export const urlsAreSamePage = (href1: string, href2: string): boolean =>
  stripQuery(href1) === stripQuery(href2);

export const addTrailingSlash = (href: string): string => {
  const url = hrefToUrl(href);
  if (url.pathname.endsWith("/")) {
    return href;
  }
  url.pathname += "/";
  return url.toString();
};
