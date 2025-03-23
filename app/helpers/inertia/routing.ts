import { usePage } from "./page";

export const useQueryParams = (): Record<string, string> => {
  const { url } = usePage();
  return useMemo(() => queryParamsFromPath(url), [url]);
};

export const queryParamsFromPath = (path: string) => {
  const [, search] = path.split("?");
  const params = new URLSearchParams(search);
  return Object.fromEntries(params.entries());
};
