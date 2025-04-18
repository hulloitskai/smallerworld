const SERVICE_WORKER_URL = "/sw.js";
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

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
          // Skip if service worker is waiting or installing, or if offline
          if (
            !registration.active ||
            !("connection" in navigator) ||
            !navigator.onLine
          ) {
            return;
          }

          // Check for update, if service worker URL is reachable
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
      onSuccess: () => {
        console.info(`Navigation to '${url}' completed successfully`);
        const [port] = ports;
        port?.postMessage({ result: "success" });
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
    void ready.then(registration => {
      setServiceWorker(registration.active);
      if (registration.installing) {
        registration.installing.addEventListener("statechange", () => {
          setServiceWorker(registration.active);
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
