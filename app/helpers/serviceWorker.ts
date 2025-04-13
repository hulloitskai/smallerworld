import deprecatedServiceWorkerSrc from "~/entrypoints/sw-deprecated.ts?worker&url";

const buildDeprecatedServiceWorkerUrl = (): string => {
  const params = new URLSearchParams();
  params.set("worker_src", deprecatedServiceWorkerSrc);
  return "/sw.js?" + params.toString();
};

const DEPRECATED_SERVICE_WORKER_URL = buildDeprecatedServiceWorkerUrl();
const SERVICE_WORKER_URL = "/sw.js";
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

export interface RegisterServiceWorkerOptions {
  deprecated: boolean;
}

export const registerServiceWorker = ({
  deprecated,
}: RegisterServiceWorkerOptions) => {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  const scriptUrl = deprecated
    ? DEPRECATED_SERVICE_WORKER_URL
    : SERVICE_WORKER_URL;
  console.info("Registering service worker at:", scriptUrl);
  void navigator.serviceWorker
    .register(scriptUrl, {
      type: import.meta.env.MODE === "production" ? "classic" : "module",
    })
    .then(
      registration => {
        setInterval(() => {
          if (registration.installing || !navigator) {
            return;
          }
          if ("connection" in navigator && !navigator.onLine) {
            return;
          }
          void fetch(scriptUrl, {
            cache: "no-store",
            headers: {
              cache: "no-store",
              "cache-control": "no-cache",
            },
          }).then(response => {
            if (response.status === 200) {
              return registration.update();
            }
          });
        }, UPDATE_INTERVAL);
      },
      error => {
        console.error("Service worker registration error", error);
      },
    );
};

export const handleServiceWorkerNavigation = (): void => {
  const handleMessage = ({ data }: MessageEvent<any>): void => {
    if (typeof data !== "object" || !("action" in data)) {
      return;
    }
    const { action } = data;
    switch (action) {
      case "navigate": {
        console.info("Received navigation request from service worker", data);
        const { url } = data;
        if (typeof url !== "string" || url !== location.href) {
          return;
        }
        router.visit(url);
        break;
      }
    }
  };
  navigator.serviceWorker.addEventListener("message", handleMessage);
};
