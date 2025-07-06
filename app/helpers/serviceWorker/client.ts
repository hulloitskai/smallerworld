import useSWR from "swr";

import { awaitTimeout } from "~/helpers/utils";

import {
  SERVICE_WORKER_METADATA_ENDPOINT,
  SERVICE_WORKER_UPDATE_INTERVAL,
  SERVICE_WORKER_URL,
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
  if (!("serviceWorker" in navigator)) {
    return;
  }
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
    const { active, installing } = registration;
    if (!active || !installing) {
      return;
    }
    console.info("Service worker updating...");
    installing.addEventListener("statechange", () => {
      switch (installing.state) {
        case "installed": {
          console.info("New service worker installed");
          if (active.state === "activated") {
            console.info(
              "Old service worker still active; sending shutdown signal",
            );
            void Promise.race([
              shutdownServiceWorker(active),
              awaitTimeout(5000),
            ]).then(() => {
              if (installing.state !== "installed") {
                return;
              }
              console.info("Skipping waiting on new service worker");
              return skipWaitingServiceWorker(installing);
            });
          }
          break;
        }
        case "activated": {
          console.info("New service worker activated");
          break;
        }
        case "redundant": {
          console.error("Service worker update failed");
          break;
        }
      }
    });
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
  if (!("serviceWorker" in navigator)) {
    return;
  }
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

const normalizeUrl = (url: string): string =>
  new URL(url, location.origin).toString();

export const handleServiceWorkerNavigation = (): void => {
  const handleMessage = ({ data, ports }: MessageEvent<any>): void => {
    const [responsePort] = ports;
    invariant(
      typeof data === "object" && "action" in data,
      "Invalid message data",
    );
    const { action } = data;
    if (action !== "navigate") {
      return;
    }
    const { url } = data;
    invariant(typeof url === "string", "Invalid navigation URL");
    console.info("Received service worker navigation request to:", url);
    if (url === location.href) {
      console.info("Already on this page, skipping navigation");
      return;
    }

    router.visit(url, {
      onBefore: () => {
        responsePort?.postMessage({ result: "success" });
      },
      onSuccess: () => {
        console.info(`Requested navigation to '${url}' successful`);
      },
    });
  };

  navigator.serviceWorker.addEventListener("message", handleMessage);
};

export const useActiveServiceWorker = (): ServiceWorker | null | undefined => {
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>();
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setServiceWorker(null);
      return;
    }
    const { controller, ready } = navigator.serviceWorker;
    if (controller) {
      setServiceWorker(controller);
      return;
    }
    void ready.then(({ active, installing }) => {
      setServiceWorker(active);
      if (installing) {
        installing.addEventListener("statechange", () => {
          setServiceWorker(installing);
        });
      }
    });
  }, []);
  return serviceWorker;
};

const shutdownServiceWorker = (sw: ServiceWorker): Promise<void> =>
  new Promise((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = ({ data }) => {
      invariant(typeof data === "object", "Invalid message data");
      const { success } = data;
      if (success) {
        resolve();
        console.info("Old service worker shutdown started");
      } else {
        const message = "Failed to shutdown old service worker";
        console.error(message);
        reject(new Error(message));
      }
    };
    sw.postMessage({ action: "shutdown" }, [port2]);
  });

const skipWaitingServiceWorker = (sw: ServiceWorker): Promise<void> =>
  new Promise((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = ({ data }) => {
      invariant(typeof data === "object", "Invalid message data");
      const { success, error } = data;
      if (success) {
        console.info("New service worker skipped waiting");
        resolve();
      } else if (error) {
        const message = "Failed to skip waiting on new service worker";
        console.error(message, error);
        reject(new Error(message));
      }
    };
    sw.postMessage({ action: "skipWaiting" }, [port2]);
  });

export const fetchServiceWorkerMetadata =
  async (): Promise<ServiceWorkerMetadata> => {
    await navigator.serviceWorker.ready;
    const maxAttempts = 3;
    let attempts = 0;
    while (attempts < maxAttempts) {
      attempts += 1;
      const response = await fetch(SERVICE_WORKER_METADATA_ENDPOINT);
      if (response.status === 200) {
        const metadata: ServiceWorkerMetadata = await response.json();
        return metadata;
      }

      console.error(
        `Failed to fetch service worker metadata (status code ${response.status}), attempt ${attempts}/${maxAttempts}`,
      );
      if (attempts < maxAttempts) {
        await awaitTimeout(1000);
      }
    }
    throw new Error(
      `Failed to fetch service worker metadata after ${maxAttempts} attempts`,
    );
  };

export const useServiceWorkerMetadata = ():
  | ServiceWorkerMetadata
  | undefined => {
  const { data, mutate } = useSWR(
    SERVICE_WORKER_METADATA_ENDPOINT,
    fetchServiceWorkerMetadata,
    {
      revalidateOnMount: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: data => {
        console.info("Loaded service worker metadata", data);
      },
    },
  );
  useEffect(() => {
    const unsubscribeRef: { current?: () => void } = {};
    void navigator.serviceWorker.ready.then(registration => {
      if (registration.active) {
        void mutate();
      }
      const handleUpdateFound = (): void => {
        const { active, installing } = registration;
        if (!active || !installing) {
          return;
        }
        const handleStateChange = (): void => {
          const stopListening = (): void => {
            installing.removeEventListener("statechange", handleStateChange);
          };
          switch (installing.state) {
            case "installed": {
              void mutate();
              stopListening();
              break;
            }
            case "redundant": {
              stopListening();
              break;
            }
          }
        };
        installing.addEventListener("statechange", handleStateChange);
      };
      registration.addEventListener("updatefound", handleUpdateFound);
      unsubscribeRef.current = () => {
        registration.removeEventListener("updatefound", handleUpdateFound);
      };
    });
    return () => {
      unsubscribeRef.current?.();
    };
  }, [mutate]);
  return data;
};
