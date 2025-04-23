const SERVICE_WORKER_URL = "/sw.js";
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

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
    console.info("Updating service worker...");
    await registration.update();
    console.info("Service worker updated");
  }
};

export const registerServiceWorker = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  console.info("Registering service worker at:", SERVICE_WORKER_URL);
  try {
    const type: WorkerType =
      import.meta.env.MODE === "production" ? "classic" : "module";
    const registration = await navigator.serviceWorker.register(
      SERVICE_WORKER_URL,
      { type },
    );
    console.info("Service worker registered", pick(registration, "scope"));

    // Listen for update
    registration.addEventListener("updatefound", () => {
      console.info("Service worker update found");
      void updateServiceWorkerIfScriptIsReachable(registration);
    });

    // Poll for service worker updates
    setInterval(() => {
      if (!registration.active) {
        console.info(
          "No active registration; skipping service worker update check",
        );
        return;
      }
      if (!("connection" in navigator) || !navigator.onLine) {
        console.info("Offline; skipping service worker update check");
        return;
      }
      console.info("Checking for service worker updates");
      void updateServiceWorkerIfScriptIsReachable(registration);
    }, UPDATE_INTERVAL);
  } catch (error) {
    console.error("Service worker registration error", error);
  }
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
    if (typeof data !== "object") {
      return;
    }
    const { action, url } = data;
    if (action !== "navigate" || typeof url !== "string") {
      return;
    }
    console.info("Received service worker navigation request to:", url);
    if (url === location.href) {
      console.info("Already on this page, skipping navigation");
      return;
    }

    router.visit(url, {
      onBefore: () => {
        const [port] = ports;
        port?.postMessage({ result: "success" });
      },
      onSuccess: () => {
        console.info(`Requested navigation to '${url}' successful`);
      },
    });
  };

  navigator.serviceWorker.addEventListener("message", handleMessage);
};

const useServiceWorker = (): ServiceWorker | null | undefined => {
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
        installing.addEventListener("statechange", function () {
          setServiceWorker(this);
        });
      }
    });
  }, []);
  return serviceWorker;
};

export const useWaitingForServiceWorkerReady = (): boolean => {
  const isStandalone = useIsStandalone();
  const serviceWorker = useServiceWorker();
  return isStandalone ? !serviceWorker : false;
};
