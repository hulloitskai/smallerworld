import { type PathHelper, type RequestOptions } from "@js-from-routes/client";
import { useNetwork } from "@mantine/hooks";
import useSWR, {
  type Key,
  mutate,
  type SWRConfiguration,
  type SWRResponse,
} from "swr";
import {
  cache,
  type MutatorCallback,
  type MutatorOptions,
} from "swr/_internal";
import useSWRMutation, {
  type SWRMutationConfiguration,
  type SWRMutationResponse,
} from "swr/mutation";

import { type FetchRouteOptions } from "./fetch";

export interface RouteSWRResponse<Data>
  extends Omit<SWRResponse<Data, Error>, "isLoading" | "isValidating"> {
  fetching: boolean;
  validating: boolean;
}

export type RouteSWROptions<Data> = Omit<FetchRouteOptions, "params"> &
  SWRConfiguration<Data, Error> & {
    params?: FetchRouteOptions["params"] | null;
  };

export const useRouteSWR = <
  Data extends Record<string, any> & { error?: never },
>(
  route: PathHelper,
  options: RouteSWROptions<Data>,
): RouteSWRResponse<Data> => {
  const {
    method,
    failSilently,
    descriptor,
    params,
    data,
    deserializeData,
    fetchOptions,
    serializeData,
    responseAs,
    headers,
    ...swrConfiguration
  } = options;

  // NOTE: Avoid 'isVisible is not a function', etc.
  if (!swrConfiguration.isVisible) {
    delete swrConfiguration.isVisible;
  }
  if (!swrConfiguration.isOnline) {
    delete swrConfiguration.isOnline;
  }
  if (!swrConfiguration.isPaused) {
    delete swrConfiguration.isPaused;
  }

  const key = computeRouteKey(route, params);
  const { online } = useNetwork();
  const { isStandalone, outOfPWAScope, freshCSRF } = usePWA();
  const { isLoading, isValidating, ...swrResponse } = useSWR<Data, Error>(
    !!freshCSRF || isStandalone === false || outOfPWAScope ? key : null,
    async (url: string): Promise<Data> =>
      fetchRoute(url, {
        failSilently,
        descriptor,
        data,
        deserializeData,
        fetchOptions,
        method: method ?? route.httpMethod,
        serializeData,
        responseAs,
        headers,
      }),
    {
      isOnline: () => online,
      ...swrConfiguration,
    },
  );

  return { fetching: isLoading, validating: isValidating, ...swrResponse };
};

export interface RouteMutationResponse<Data, ExtraArg>
  extends Omit<SWRMutationResponse<Data, Error, Key, ExtraArg>, "isMutating"> {
  mutating: boolean;
}

export type RouteMutationOptions<Data, ExtraArg> = Omit<
  FetchRouteOptions,
  "params"
> &
  SWRMutationConfiguration<Data, Error, Key, ExtraArg, Data> & {
    params?: FetchRouteOptions["params"] | null;
  };

export const useRouteMutation = <
  Data extends Record<string, any> & { error?: never },
  ExtraArg = any,
>(
  route: PathHelper,
  options: RouteMutationOptions<Data, ExtraArg>,
): RouteMutationResponse<Data, ExtraArg> => {
  const {
    method,
    failSilently,
    descriptor,
    params,
    data,
    deserializeData,
    fetchOptions,
    serializeData,
    responseAs,
    headers,
    ...swrConfiguration
  } = options;

  const key = computeRouteKey(route, params);
  const { isMutating: mutating, ...swr } = useSWRMutation<
    Data,
    Error,
    Key,
    ExtraArg
  >(
    key,
    async (url: string, { arg }: { arg: ExtraArg }): Promise<Data> =>
      fetchRoute(url, {
        failSilently,
        descriptor,
        data: arg ?? data,
        deserializeData,
        fetchOptions,
        method: method ?? route.httpMethod,
        serializeData,
        responseAs,
        headers,
      }),
    {
      ...swrConfiguration,
    },
  );

  return { mutating, ...swr };
};

export const computeRouteKey = (
  route: PathHelper,
  params: RequestOptions["params"] | null,
): string | null => (params === null ? null : route.path(params));

export const mutateRoute = <Data, T = Data>(
  route: PathHelper,
  params: RequestOptions["params"] = {},
  data?: T | Promise<T> | MutatorCallback<T>,
  options?: boolean | MutatorOptions<Data, T>,
) => mutate<Data, T>(route.path(params), data, options);

export const resetSWRCache = async (): Promise<void> => {
  await Promise.all([...cache.keys()].map(key => mutate(key)));
};
