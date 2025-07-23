import {
  type BrowserOptions,
  captureConsoleIntegration,
  captureException,
  httpClientIntegration,
  init as initSentry,
} from "@sentry/browser";
import {
  createStore,
  get as getStoreValue,
  set as setStoreValue,
} from "idb-keyval";
import { isEmpty, pick } from "lodash-es";
import invariant from "tiny-invariant";
import { v4 as uuid } from "uuid";
import { enable as enableNavigationPreload } from "workbox-navigation-preload";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkOnly } from "workbox-strategies";

import { DEFAULT_NOTIFICATION_ICON_URL } from "~/helpers/notifications";
import routes, { setupRoutes } from "~/helpers/routes";
import { beforeSend, DENY_URLS } from "~/helpers/sentry/filtering";
import {
  type ServiceWorkerCommandMessage,
  type ServiceWorkerMetadata,
} from "~/helpers/serviceWorker";
import { type Notification, type NotificationMessage } from "~/types";

// == Type declarations
declare const self: ServiceWorkerGlobalScope;

// == Constants
const MANIFEST = self.__WB_MANIFEST;
const SERVICE_WORKER_VERSION = 2;
const metadataStore = createStore("smallerworld", "metadata");

// == Lifecycle
let shuttingDown = false;

// == Helpers
const awaitTimeout = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// == Fetch interception
self.addEventListener("fetch", event => {
  // Don't perform fetches when shutting down
  if (shuttingDown) {
    event.stopImmediatePropagation();
    return;
  }

  // Ignore EventStream requests
  const { request } = event;
  if (request.headers.get("Accept") === "text/event-stream") {
    event.stopImmediatePropagation();
    return;
  }
});

// == Setup
setupRoutes();
enableNavigationPreload();
if (!isEmpty(MANIFEST)) {
  console.info("Precaching routes", MANIFEST);
  precacheAndRoute(MANIFEST, { cleanURLs: false });
}
registerRoute(
  ({ request }) => ["", "document"].includes(request.destination),
  new NetworkOnly(),
);
registerRoute(
  ({ request, url }) =>
    request.destination === "image" &&
    url.hostname === "cdn.jsdelivr.net" &&
    url.pathname.startsWith("/npm/emoji-datasource-apple/img/"),
  new CacheFirst({ cacheName: "emoji-datasource-apple" }),
);
registerRoute(
  ({ request, url }) =>
    request.destination === "image" &&
    url.hostname === "tttkkdzhzvelxmbcqvlg.supabase.co" &&
    url.pathname.startsWith("/storage/v1/object/public/emoji-stickers/"),
  new CacheFirst({ cacheName: "emoji-stickers" }),
);
cleanupOutdatedCaches();

// == Lifecycle
self.addEventListener("install", event => {
  console.info("Service worker installed");
  event.waitUntil(
    Promise.race([
      self.skipWaiting().then(
        () => {
          console.info("Service worker skipped waiting");
        },
        reason => {
          console.error("Service worker skipped waiting failed", reason);
        },
      ),
      awaitTimeout(1000).then(() => {
        console.warn("Service worker skip waiting timed out");
      }),
    ]),
  );
});

self.addEventListener("activate", event => {
  console.info("Service worker activating (claiming clients)...");
  event.waitUntil(
    self.clients.claim().then(
      () => {
        console.info("Service worker activated");
      },
      reason => {
        console.error("Claiming clients failed", reason);
        throw reason; // Re-throw to fail activation
      },
    ),
  );
});

// == Helpers
const markDelivered = (
  notification: Notification & { delivery_token: string },
): Promise<void> =>
  routes.notifications
    .markDelivered<{}>({
      query: {
        delivery_token: notification.delivery_token,
      },
    })
    .then(
      () => {
        console.info(`Marked notification '${notification.id}' as delivered`);
      },
      reason => {
        console.error(
          `Failed to mark notification '${notification.id}' as delivered`,
          reason,
        );
      },
    );

const pathname = (url: string): string => {
  const { pathname } = new URL(url, self.location.origin);
  return pathname;
};

// == Push handlers
interface NotificationData {
  notification?: Notification;
  message?: NotificationMessage;
  pageIconUrl?: string;
  badgeCount?: number;
}

self.addEventListener("push", event => {
  invariant(event.data, "Missing push event data");

  const data: NotificationData = event.data.json();
  console.debug("Received push event", data);
  const { notification, message, pageIconUrl, badgeCount } = data;

  const actions: Promise<void>[] = [];
  if (notification) {
    const { title, body, image_url } = notification;
    actions.push(
      self.registration.showNotification(title, {
        icon: pageIconUrl ?? DEFAULT_NOTIFICATION_ICON_URL,
        body: body ?? undefined,
        data,
        ...(image_url && { type: "image", imageUrl: image_url }),
      }),
    );
    if (notification.delivery_token) {
      actions.push(
        markDelivered({
          ...notification,
          delivery_token: notification.delivery_token,
        }),
      );
    }
  } else if (message) {
    const { title, body, image_url } = message;
    actions.push(
      self.registration.showNotification(title, {
        icon: pageIconUrl ?? DEFAULT_NOTIFICATION_ICON_URL,
        body: body ?? undefined,
        data,
        ...(image_url && { type: "image", imageUrl: image_url }),
      }),
    );
  } else {
    actions.push(
      self.registration.showNotification("unsupported notification", {
        body: "this version of smaller world doesn't support this notification type. please re-open to update!",
        icon: pageIconUrl ?? DEFAULT_NOTIFICATION_ICON_URL,
      }),
    );
  }
  if (navigator.setAppBadge && badgeCount) {
    actions.push(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then(clients => {
          if (clients.some(client => client.visibilityState === "hidden")) {
            return;
          }
          console.info("Setting app badge", badgeCount);
          try {
            return navigator.setAppBadge(badgeCount);
          } catch (error) {
            console.error("Failed to set app badge", error);
          }
        }),
    );
  }

  event.waitUntil(Promise.all(actions));
});

interface PushSubscriptionAttributes {
  endpoint: string;
  auth_key: string;
  p256dh_key: string;
}

const pushSubscriptionAttributes = (
  subscription: PushSubscription,
): PushSubscriptionAttributes => {
  const { keys } = pick(
    subscription.toJSON(),
    "endpoint",
    "keys.auth",
    "keys.p256dh",
  );
  if (!keys?.auth) {
    throw new Error("Missing push subscription auth key");
  }
  if (!keys?.p256dh) {
    throw new Error("Missing push subscription p256dh key");
  }
  return {
    endpoint: subscription.endpoint,
    auth_key: keys.auth,
    p256dh_key: keys.p256dh,
  };
};

self.addEventListener("pushsubscriptionchange", event => {
  const changeEvent = event as PushSubscriptionChangeEvent;
  const { newSubscription, oldSubscription } = changeEvent;
  changeEvent.waitUntil(
    routes.pushSubscriptions
      .change({
        data: {
          old_subscription: oldSubscription
            ? { endpoint: oldSubscription.endpoint }
            : null,
          new_subscription: newSubscription
            ? pushSubscriptionAttributes(newSubscription)
            : null,
        },
      })
      .catch(reason => {
        console.error("Failed to change push subscription", reason);
      }),
  );
});

self.addEventListener("notificationclick", event => {
  const data: NotificationData = event.notification.data;
  console.debug("Notification clicked", data);
  event.notification.close(); // Android needs explicit close

  const { notification, message }: NotificationData = event.notification.data;
  const { target_url } = notification ?? message ?? {};
  if (!target_url) {
    return;
  }

  console.debug("Requesting navigation to", target_url);
  // Open the target URL
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async clients => {
        // Check if there is already a window/tab open with the target path
        for (const client of clients) {
          // Skip clients that don't support focus
          if (!("focus" in client)) {
            continue;
          }

          // Skip clients that are on a different page
          if (pathname(client.url) !== pathname(target_url)) {
            continue;
          }

          // Focus client
          if (!client.focused) {
            await client.focus();
          }

          // Skip clients whose full URLs match
          if (client.url === target_url) {
            return client;
          }

          // Create a MessageChannel for two-way communication
          const { port1, port2 } = new MessageChannel();

          // Set up a promise that resolves when navigation succeeds or times out
          let navigationSuccessful = false;
          const navigationPromise = new Promise<boolean>(resolve => {
            // Listen for confirmation from the client
            port1.onmessage = ({ data }) => {
              if (data && typeof data === "object") {
                const { result } = data;
                if (result === "success") {
                  navigationSuccessful = true;
                  resolve(true);
                }
              }
            };

            // Set a timeout for fallback
            setTimeout(() => {
              if (!navigationSuccessful) {
                resolve(false);
              }
            }, 1000);
          });

          // Send client-side navigation request with MessagePort
          client.postMessage({ action: "navigate", url: target_url }, [port2]);

          // Wait for navigation to complete or timeout
          const success = await navigationPromise;
          if (!success) {
            console.info(
              "Client-side navigation timed out, falling back to client.navigate()",
            );
            await client.navigate(target_url);
          }
          return client;
        }

        // If not, then open the target URL in a new window/tab.
        return self.clients.openWindow(target_url);
      }),
  );
});

const getDeviceId = async (): Promise<string> => {
  const deviceId = await getStoreValue<string>("device_id", metadataStore);
  if (deviceId) {
    return deviceId;
  }
  const newDeviceId = uuid();
  await setStoreValue("device_id", newDeviceId, metadataStore);
  return newDeviceId;
};

const processInitSentry = (config: BrowserOptions): void => {
  try {
    initSentry({
      ...config,
      integrations: [
        captureConsoleIntegration({ levels: ["error", "assert"] }),
        httpClientIntegration(),
      ],
      denyUrls: DENY_URLS,
      beforeSend,
    });
    console.info("Initialized Sentry", config);
  } catch (error) {
    console.error("Failed to initialize Sentry", error);
    throw error;
  }
};

const processShutdown = (): void => {
  shuttingDown = true;
};

const processSkipWaiting = async (): Promise<void> => {
  try {
    await self.skipWaiting();
    console.info("Skipped waiting");
  } catch (error) {
    console.error("Failed to skip waiting", error);
    throw error;
  }
};

const processGetMetadata = async (): Promise<ServiceWorkerMetadata> => {
  const deviceId = await getDeviceId();
  return {
    deviceId,
    serviceWorkerVersion: SERVICE_WORKER_VERSION,
  };
};

const processCommand = async (
  message: ServiceWorkerCommandMessage,
): Promise<any> => {
  switch (message.command) {
    case "initSentry":
      return processInitSentry(message.options);
    case "shutdown":
      return processShutdown();
    case "skipWaiting":
      return processSkipWaiting();
    case "getMetadata": {
      const metadata = await processGetMetadata();
      return { metadata };
    }
  }
};

const isValidCommandMessage = (
  data: any,
): data is ServiceWorkerCommandMessage =>
  typeof data === "object" &&
  data !== null &&
  "command" in data &&
  typeof data.command === "string"; // eslint-disable-line @typescript-eslint/no-unsafe-member-access

self.addEventListener("message", event => {
  const { data, ports } = event;
  if (!isValidCommandMessage(data)) {
    throw new Error("Invalid command message");
  }
  const [responsePort] = ports;
  if (!responsePort) {
    throw new Error("Missing response port");
  }
  event.waitUntil(
    processCommand(data)
      .then<Record<string, any>, Record<string, any>>(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        result => (typeof result === "object" && result !== null ? result : {}),
        reason => ({
          error: reason instanceof Error ? reason.message : String(reason),
        }),
      )
      .then(response => responsePort.postMessage(response)),
  );
});

self.addEventListener("error", ({ error }) => {
  captureException(error);
});

self.addEventListener("unhandledrejection", ({ reason }) => {
  captureException(reason);
});

console.info("Service worker initialized with scope", self.registration.scope);
