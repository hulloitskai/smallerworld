const SERVICE_WORKER_URL = "/sw.js";
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

export interface RegisterServiceWorkerOptions {
  deprecated: boolean;
}

export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  console.info("Registering service worker at:", SERVICE_WORKER_URL);
  void navigator.serviceWorker
    .register(SERVICE_WORKER_URL, {
      type: import.meta.env.MODE === "production" ? "classic" : "module",
    })
    .then(
      registration => {
        console.info("Service worker registered", pick(registration, "scope"));
        if (registration.active) {
          registration.addEventListener("updatefound", () => {
            console.info("Service worker update found");
            void registration.update().then(() => {
              console.info("Service worker updated");
            });
          });
        }
        setInterval(() => {
          if (!registration.active) {
            return;
          }
          if ("connection" in navigator && !navigator.onLine) {
            return;
          }
          void fetch(SERVICE_WORKER_URL, {
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
