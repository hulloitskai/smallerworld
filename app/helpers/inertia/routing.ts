import { usePage } from "./page";

export const useQueryParams = (): Record<string, string> => {
  const { url } = usePage();
  return useMemo(() => {
    const [, search] = url.split("?");
    const params = new URLSearchParams(search);
    return Object.fromEntries(params.entries());
  }, [url]);
};
