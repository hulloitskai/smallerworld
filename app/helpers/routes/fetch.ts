import {
  type Method,
  type PathHelper,
  request,
  type RequestOptions,
  type ResponseError,
} from "@js-from-routes/client";

import { isCSRFVerificationError, toastInvalidCSRFToken } from "~/helpers/csrf";

export type FetchRouteOptions = Partial<
  Omit<RequestOptions, "method" | "fetch">
> & {
  descriptor: string;
  method?: Method;
  failSilently?: boolean;
};

export const fetchRoute = async <Data>(
  route: PathHelper | string,
  options: FetchRouteOptions,
): Promise<Data> => {
  const { descriptor, failSilently, ...routeOptions } = options;
  const handleError = (responseError: ResponseError) => {
    const { body, response } = responseError;
    if (isErrorBody(body)) {
      const { error } = body;
      console.error(`Failed to ${descriptor}`, error);
      if (isCSRFVerificationError(error)) {
        toastInvalidCSRFToken();
      } else if (!failSilently) {
        const message =
          response?.status === 503
            ? "server is unresponsive; retrying..."
            : typeof error === "string"
              ? error
              : "an unknown error occurred.";
        toast.error(`failed to ${descriptor}`, { description: message });
      }
      throw new Error(error);
    } else {
      console.error(`Failed to ${descriptor}`, responseError);
      if (!failSilently) {
        toast.error(`failed to ${descriptor}`, {
          description: responseError.message,
        });
      }
      throw responseError;
    }
  };
  if (typeof route === "string") {
    const { method, ...requestOptions } = omit(routeOptions, "params");
    return request(method ?? "get", route, requestOptions).then(
      undefined,
      handleError,
    );
  }
  return route<Data>(routeOptions).then(undefined, handleError);
};

const isErrorBody = (body: any): body is { error: string } =>
  typeof get(body, "error") === "string";
