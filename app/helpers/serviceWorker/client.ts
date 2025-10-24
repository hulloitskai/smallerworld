import { type BrowserOptions } from "@sentry/browser";

import { urlsAreSamePage } from "~/helpers/utils";

import {
  SERVICE_WORKER_UPDATE_INTERVAL,
  SERVICE_WORKER_URL,
  type ServiceWorkerCommandMessage,
  type ServiceWorkerMetadata,
} from ".";

const updateServiceWorkerIfScriptIsReachable = async (
  registration: ServiceWorkerRegistration,
): Promise<void> => {
  const { status } = await fetch(SERVICE_WORKER_URL, {
    cache: "no-store",
    headers: {
      cache: "no-store",
      "cache-control": "no-cache",
    },
  });
  if (status === 200) {
    console.info("Checking for service worker updates...");
    void registration.update();
  }
};

export const registerServiceWorker = async (): Promise<void> => {
  console.info("Registering service worker at:", SERVICE_WORKER_URL);
  let registration: ServiceWorkerRegistration | undefined = undefined;
  try {
    const type: WorkerType =
      import.meta.env.MODE === "production" ? "classic" : "module";
    registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
      type,
    });
    console.info("Service worker registered", pick(registration, "scope"));
  } catch (error) {
    if (error instanceof Error && error.message === "Rejected") {
      console.info("Service worker registration rejected");
    } else {
      console.error("Service worker registration error", error);
    }
  }
  if (!registration) {
    return;
  }

  // Listen for update
  registration.addEventListener("updatefound", () => {
    const { active: oldWorker, installing, waiting } = registration;
    const newWorker = installing ?? waiting;
    if (!newWorker) {
      return;
    }
    console.info("Service worker update found", { oldWorker, newWorker });
    const handleNewWorkerStateChange = (): void => {
      const stopListening = (): void =>
        newWorker.removeEventListener(
          "statechange",
          handleNewWorkerStateChange,
        );
      switch (newWorker.state) {
        case "installed": {
          console.info("New service worker installed");
          if (oldWorker?.state === "activated") {
            console.info(
              "Old service worker still active; sending shutdown signal",
            );
            void sendShutdown(oldWorker, 5000).then(() => {
              if (newWorker.state !== "installed") {
                return;
              }
              console.info("Skipping waiting on new service worker");
              return sendSkipWaiting(newWorker);
            });
          }
          break;
        }
        case "activated": {
          stopListening();
          console.info("New service worker activated");
          break;
        }
        case "redundant": {
          stopListening();
          console.error("Service worker update failed");
          break;
        }
      }
    };
    newWorker.addEventListener("statechange", handleNewWorkerStateChange);
  });

  // Poll for service worker updates
  setInterval(() => {
    if (registration.installing) {
      console.info("Service worker installing; skipping update check");
      return;
    }
    if (!("connection" in navigator) || !navigator.onLine) {
      console.info("Offline; skipping service worker update check");
      return;
    }
    void updateServiceWorkerIfScriptIsReachable(registration);
  }, SERVICE_WORKER_UPDATE_INTERVAL);

  void updateServiceWorkerIfScriptIsReachable(registration);
};

export const unregisterOutdatedServiceWorkers = async (): Promise<void> => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  const oldRegistrations = registrations.filter(
    ({ active }) =>
      active &&
      normalizeUrl(active.scriptURL) !== normalizeUrl(SERVICE_WORKER_URL),
  );
  await Promise.all(
    oldRegistrations.map(registration => registration.unregister()),
  );
};

export const handleServiceWorkerMessages = (): void => {
  const handleMessage = ({ data, ports }: MessageEvent<any>): void => {
    const [responsePort] = ports;
    if (typeof data !== "object" || !data) {
      return;
    }
    const { meta } = data;
    if (typeof meta !== "string") {
      return;
    }
    switch (meta) {
      case "navigate": {
        const { url } = data;
        invariant(typeof url === "string", "Invalid navigation URL");
        console.info("Received service worker navigation request to:", url);
        if (url === location.href) {
          console.info("Already on this page, skipping navigation");
          break;
        }
        startTransition(() => {
          router.visit(url, {
            onBefore: () => {
              responsePort?.postMessage({ result: "success" });
            },
            onSuccess: () => {
              console.info(`Requested navigation to '${url}' successful`);
            },
          });
        });
        break;
      }
      case "workbox-broadcast-update": {
        const { payload } = data;
        invariant(typeof payload === "object" && !!payload, "Invalid payload");
        const { cacheName, updatedURL } = payload;
        invariant(typeof cacheName === "string", "Invalid cacheName type");
        invariant(typeof updatedURL === "string", "Invalid updatedURL type");
        console.info(
          "Received service worker broadcast update to:",
          updatedURL,
          { cacheName },
        );
        if (urlsAreSamePage(updatedURL, location.href)) {
          console.info("Refreshing page due to stale content");
          router.reload({ async: true });
        }
        break;
      }
    }
  };

  navigator.serviceWorker.addEventListener("message", handleMessage);
};

export const waitForActiveServiceWorker = async (): Promise<ServiceWorker> => {
  const { active, installing, waiting } = await navigator.serviceWorker.ready;
  if (active) {
    return active;
  }
  if (installing) {
    return waitForServiceWorkerToActivate(installing);
  }
  if (waiting) {
    return waitForServiceWorkerToActivate(waiting);
  }
  throw new Error("No service worker found");
};

const waitForServiceWorkerToActivate = (
  serviceWorker: ServiceWorker,
): Promise<ServiceWorker> => {
  if (serviceWorker.state === "activated") {
    return Promise.resolve(serviceWorker);
  }
  return new Promise((resolve, reject) => {
    const handleNewWorkerStateChange = (): void => {
      const stopListening = (): void => {
        serviceWorker.removeEventListener(
          "statechange",
          handleNewWorkerStateChange,
        );
      };
      switch (serviceWorker.state) {
        case "activated": {
          stopListening();
          resolve(serviceWorker);
          break;
        }
        case "redundant": {
          stopListening();
          reject(new Error("Service worker installation failed"));
          break;
        }
      }
    };
    serviceWorker.addEventListener("statechange", handleNewWorkerStateChange);
  });
};

export const useActiveServiceWorker = (): ServiceWorker | null | undefined => {
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>();
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setServiceWorker(null);
      return;
    }
    const { serviceWorker } = navigator;
    const { controller, ready } = serviceWorker;
    if (controller) {
      setServiceWorker(controller);
      return;
    }
    void ready.then(({ active }) => {
      if (active) {
        setServiceWorker(active);
      }
    });
    const handleChange = (): void => {
      setServiceWorker(serviceWorker.controller);
    };
    serviceWorker.addEventListener("controllerchange", handleChange);
    return () => {
      serviceWorker.removeEventListener("controllerchange", handleChange);
    };
  }, []);
  return serviceWorker;
};

const isValidCommandResponse = (data: any): data is Record<string, any> =>
  typeof data === "object" && data !== null;

const sendCommand = <T extends Record<string, any>>(
  serviceWorker: ServiceWorker,
  message: ServiceWorkerCommandMessage,
  timeout = 1000,
): Promise<T> =>
  new Promise((resolve, reject) => {
    const messageTimeout = setTimeout(() => {
      const reason = `Command timeout after ${timeout}ms: ${JSON.stringify(
        message,
      )}`;
      reject(new Error(reason));
    }, timeout);
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = ({ data }) => {
      clearTimeout(messageTimeout);
      if (isValidCommandResponse(data)) {
        if ("error" in data) {
          if (typeof data.error === "string") {
            reject(new Error(data.error));
          } else {
            reject(new Error(`Invalid error field: ${data.error}`));
          }
        } else {
          resolve(data as T);
        }
      } else {
        const reason = `Invalid response data: ${JSON.stringify(data)}`;
        reject(new Error(reason));
      }
    };
    serviceWorker.postMessage(message, [port2]);
  });

const sendShutdown = (
  serviceWorker: ServiceWorker,
  timeout?: number,
): Promise<void> =>
  sendCommand(serviceWorker, { command: "shutdown" }, timeout).then(() => {
    console.info("Old service worker shutdown started");
  });

const sendSkipWaiting = (serviceWorker: ServiceWorker): Promise<void> =>
  sendCommand(serviceWorker, { command: "skipWaiting" }).then(
    () => {
      console.info("New service worker skipped waiting");
    },
    reason => {
      console.error("Failed to skip waiting on new service worker", reason);
    },
  );

const sendPrecache = (serviceWorker: ServiceWorker): Promise<void> =>
  sendCommand(serviceWorker, { command: "precache" }).then(
    () => {
      console.info("Precaching started");
    },
    reason => {
      console.error("Failed to precache", reason);
    },
  );

const sendGetMetadata = async (
  serviceWorker: ServiceWorker,
): Promise<ServiceWorkerMetadata> => {
  const { metadata } = await sendCommand<{ metadata: ServiceWorkerMetadata }>(
    serviceWorker,
    { command: "getMetadata" },
  );
  return metadata;
};

export const initServiceWorkerSentry = (
  serviceWorker: ServiceWorker,
  options: BrowserOptions,
): Promise<void> =>
  sendCommand(serviceWorker, { command: "initSentry", options }).then(
    () => {
      console.info("Initialized Sentry on service worker");
    },
    reason => {
      console.error("Failed to initialize Sentry on service worker", reason);
    },
  );

export const getServiceWorkerMetadata = (): Promise<ServiceWorkerMetadata> =>
  waitForActiveServiceWorker().then(sendGetMetadata);

export const useServiceWorkerMetadata = ():
  | ServiceWorkerMetadata
  | null
  | undefined => {
  const [metadata, setMetadata] = useState<ServiceWorkerMetadata | null>();
  const serviceWorker = useActiveServiceWorker();
  useEffect(() => {
    if (serviceWorker) {
      void sendGetMetadata(serviceWorker).then(setMetadata);
    } else {
      setMetadata(serviceWorker);
    }
  }, [serviceWorker]);
  return metadata;
};

export const handlePrecaching = (): void => {
  void navigator.serviceWorker.ready.then(({ active }) => {
    if (active) {
      void sendPrecache(active);
    } else {
      console.warn("No active service worker found; skipping precaching");
    }
  });
};
