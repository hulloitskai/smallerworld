import { visit as turboVisit } from "@hotwired/turbo";
import { hrefToUrl, router } from "@inertiajs/core";
import { closeAllModals } from "@mantine/modals";
import { AxiosHeaders } from "axios";

import { setMeta } from "~/helpers/meta";

import { isHotwireNative } from "../hotwire";

export const setupInertia = (): void => {
  router.on("before", ({ detail: { visit } }) => {
    if (isHotwireNative()) {
      turboVisit(visit.url.toString(), {
        action: visit.replace ? "replace" : "advance",
      });
      return false;
    }
    if (!visit.preserveState) {
      closeAllModals();
    }
  });
  router.on("success", ({ detail: { page } }) => {
    const props = page.props as unknown as Partial<SharedPageProps>;
    if (props.csrf) {
      const { param, token } = props.csrf;
      setMeta("csrf-param", param);
      setMeta("csrf-token", token);
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
      const responseUrl = hrefToUrl(request.responseURL);
      if (
        responseUrl.host === location.host &&
        typeof contentType === "string" &&
        contentType.startsWith("text/html") &&
        typeof data === "string"
      ) {
        event.preventDefault();
        document.open();
        document.write(data);
        document.close();
        history.pushState(null, "", responseUrl.toString());
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
};
