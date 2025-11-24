import { queryParamsFromPath } from "~/helpers/utils";

import { usePage } from "./page";

export const useQueryParams = (): Record<string, string> => {
  const { url } = usePage();
  return useMemo(() => queryParamsFromPath(url), [url]);
};
