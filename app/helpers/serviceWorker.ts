import rawServiceWorkerUrl from "~/entrypoints/service-worker.ts?worker&url";

const buildServiceWorkerUrl = (): string => {
  const params = new URLSearchParams();
  params.set("worker", rawServiceWorkerUrl);
  return "/sw?" + params.toString();
};

export const serviceWorkerUrl = buildServiceWorkerUrl();

const REGISTRATION_OPTIONS: RegistrationOptions = {
  type: "module",
  scope: "/",
};

export const getOrRegisterServiceWorker =
  (): Promise<ServiceWorkerRegistration> =>
    navigator.serviceWorker
      .getRegistration(serviceWorkerUrl)
      .then(registration => {
        if (!registration) {
          return navigator.serviceWorker.register(
            serviceWorkerUrl,
            REGISTRATION_OPTIONS,
          );
        }
        return registration;
      });

export const handleServiceWorkerNavigation = (): void => {
  const handleMessage = ({ data }: MessageEvent<any>): void => {
    if (typeof data !== "object" || !("action" in data)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { action } = data;
    switch (action) {
      case "navigate": {
        console.info("Received navigation request from service worker", data);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

export const registerAndUpdateServiceWorker =
  (): Promise<ServiceWorkerRegistration> =>
    navigator.serviceWorker
      .register(serviceWorkerUrl, REGISTRATION_OPTIONS)
      .then(registration => registration.update().then(() => registration));

export const unregisterOldServiceWorkers = (): Promise<void> =>
  navigator.serviceWorker.getRegistrations().then(async registrations => {
    const currentScope = new URL("/", location.href).toString();
    const oldRegistrations = registrations.filter(
      registration => registration.scope !== currentScope,
    );
    if (isEmpty(oldRegistrations)) {
      return;
    }
    const oldScopes = oldRegistrations.map(registration => registration.scope);
    console.info("Unregistering old service workers with scopes:", oldScopes);
    await Promise.all(
      oldRegistrations.map(registration => registration.unregister()),
    );
  });
