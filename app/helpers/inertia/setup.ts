import { router } from "@inertiajs/core";
import { closeAllModals } from "@mantine/modals";
import { AxiosHeaders } from "axios";

export const setupInertia = (): void => {
  router.on("before", ({ detail: { visit } }) => {
    const csrfToken = getMeta("csrf-token");
    if (csrfToken) {
      visit.headers["X-CSRF-Token"] = csrfToken;
    }
  });
  router.on("invalid", event => {
    console.warn("Invalid Inertia response", event.detail.response.data);
    const { status, headers, data, request } = event.detail.response;
    if (
      !(headers instanceof AxiosHeaders) ||
      !(request instanceof XMLHttpRequest)
    ) {
      return;
    }
    if (status >= 200 && status < 300) {
      const contentType = headers.get("Content-Type");
      const url = new URL(request.responseURL);
      if (
        url.host === location.host &&
        typeof contentType === "string" &&
        contentType.startsWith("text/html") &&
        typeof data === "string"
      ) {
        event.preventDefault();
        document.open();
        document.write(data);
        document.close();
        history.pushState(null, "", url.toString());
      }
    } else if (status >= 500 && status < 600) {
      const contentType = headers.get("Content-Type");
      event.preventDefault();
      let description: string | undefined = undefined;
      if (
        typeof contentType === "string" &&
        contentType.startsWith("text/plain") &&
        typeof data === "string"
      ) {
        description = data;
      } else if (
        typeof contentType === "string" &&
        contentType.startsWith("application/json") &&
        typeof data === "object"
      ) {
        if ("error" in data) {
          const { error } = data;
          if (typeof error === "string") {
            description = error;
          }
        }
      }
      toast.error("Network request failed", { description });
    }
  });
  router.on("exception", event => {
    console.error(
      "An unexpected error occurred during an Inertia visit",
      event.detail.exception,
    );
  });
  router.on("before", () => {
    closeAllModals();
  });
};
