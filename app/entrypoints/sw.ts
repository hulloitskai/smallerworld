import {
  type BrowserOptions,
  captureConsoleIntegration,
  captureException,
  httpClientIntegration,
  init as initSentry,
} from "@sentry/browser";
import { isEmpty, pick } from "lodash-es";
import invariant from "tiny-invariant";
import { v4 as uuid } from "uuid";
import { enable as enableNavigationPreload } from "workbox-navigation-preload";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";

import {
  DEFAULT_NOTIFICATION_ICON_URL,
  notificationTargetUrl,
  renderNotification,
} from "~/helpers/notifications";
import routes, { setupRoutes } from "~/helpers/routes";
import { beforeSend, DENY_URLS } from "~/helpers/sentry/filtering";
import { type PushNotification } from "~/types";

// == Type declarations
declare const self: ServiceWorkerGlobalScope;

// == Constants
const MANIFEST = self.__WB_MANIFEST;
const DEVICE_ENDPOINT = "/device";

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

  // Parse request
  const { request } = event;
  const url = new URL(request.url);

  // Ignore EventStream requests
  if (request.headers.get("Accept") === "text/event-stream") {
    event.stopImmediatePropagation();
    return;
  }

  // Handle device metadata requests
  if (url.pathname === DEVICE_ENDPOINT) {
    console.debug("Device metadata request intercepted", url.toString());
    return event.respondWith(
      caches.open(DEVICE_ENDPOINT).then(cache =>
        cache.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          const payload = { deviceId: uuid() };
          const body = JSON.stringify(payload);
          const headers: HeadersInit = { "Content-Type": "application/json" };
          const response = new Response(body, { headers });
          return cache.put(request, response.clone()).then(() => response);
        }),
      ),
    );
  }
});

// == Setup
setupRoutes();
enableNavigationPreload();
if (!isEmpty(MANIFEST)) {
  console.info("Precaching routes", MANIFEST);
}
precacheAndRoute(MANIFEST, { cleanURLs: false });
registerRoute(
  ({ request }) => ["", "document"].includes(request.destination),
  new NetworkOnly(),
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
        error => {
          console.error("Service worker skipped waiting failed", error);
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
      error => {
        console.error("Claiming clients failed", error);
        throw error; // Re-throw to fail activation
      },
    ),
  );
});

// == Helpers
const markDelivered = (
  notification: PushNotification,
  deliveryToken: string,
): Promise<void> =>
  routes.notifications
    .markDelivered<{}>({
      query: {
        delivery_token: deliveryToken,
      },
    })
    .then(
      () => {
        console.info(`Marked notification '${notification.id}' as delivered`);
      },
      error => {
        console.error(
          `Failed to mark notification '${notification.id}' as delivered`,
          error,
        );
      },
    );

const pathname = (url: string): string => {
  const { pathname } = new URL(url, self.location.origin);
  return pathname;
};

// == Push handlers
interface NotificationData {
  notification?: PushNotification;
  pageIconUrl?: string;
  test?: true;
  badgeCount?: number;
}

self.addEventListener("push", event => {
  invariant(event.data, "Missing push event data");

  const data: NotificationData = event.data.json();
  console.debug("Received push event", data);
  const { notification, pageIconUrl, badgeCount } = data;

  const actions: Promise<void>[] = [];
  if (notification) {
    const { title, icon, ...options } = renderNotification(notification);
    actions.push(
      self.registration.showNotification(title, {
        ...options,
        icon: icon ?? pageIconUrl ?? DEFAULT_NOTIFICATION_ICON_URL,
        data,
      }),
    );
    if (notification.delivery_token) {
      actions.push(markDelivered(notification, notification.delivery_token));
    }
  } else {
    actions.push(
      self.registration.showNotification("test notification", {
        body: "this is a test notification. if you are seeing this, then your push notifications are working!",
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
      .catch(error => {
        console.error("Failed to change push subscription", error);
      }),
  );
});

self.addEventListener("notificationclick", event => {
  const data: NotificationData = event.notification.data;
  console.debug("Notification clicked", data);
  event.notification.close(); // Android needs explicit close

  const { notification }: NotificationData = event.notification.data;
  if (!notification) {
    return;
  }

  const targetUrl = notificationTargetUrl(notification);
  console.debug("Requesting navigation to", targetUrl);

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
          if (pathname(client.url) !== pathname(targetUrl)) {
            continue;
          }

          // Focus client
          if (!client.focused) {
            await client.focus();
          }

          // Skip clients whose full URLs match
          if (client.url === targetUrl) {
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
          client.postMessage({ action: "navigate", url: targetUrl }, [port2]);

          // Wait for navigation to complete or timeout
          const success = await navigationPromise;
          if (!success) {
            console.info(
              "Client-side navigation timed out, falling back to client.navigate()",
            );
            await client.navigate(targetUrl);
          }
          return client;
        }

        // If not, then open the target URL in a new window/tab.
        return self.clients.openWindow(targetUrl);
      }),
  );
});

self.addEventListener("message", event => {
  const { data, ports } = event;
  const [responsePort] = ports;
  invariant(
    typeof data === "object" && "action" in data,
    "Invalid message data",
  );
  const { action } = data;
  switch (action) {
    case "initSentry": {
      const { dsn, environment, tracesSampleRate, profilesSampleRate } = data;
      invariant(typeof dsn === "string", "Invalid Sentry DSN");
      invariant(typeof environment === "string", "Invalid Sentry environment");
      invariant(
        typeof tracesSampleRate === "number",
        "Invalid Sentry traces sample rate",
      );
      invariant(
        typeof profilesSampleRate === "number",
        "Invalid Sentry profiles sample rate",
      );
      try {
        const config: BrowserOptions = {
          dsn,
          environment,
          tracesSampleRate,
          profilesSampleRate,
          sendDefaultPii: true,
        };
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
        responsePort?.postMessage({ config });
      } catch (error) {
        console.error("Failed to initialize Sentry", error);
        if (error instanceof Error) {
          responsePort?.postMessage({ error: error.message });
        }
      }
      break;
    }
    case "skipWaiting": {
      console.info("Received skip waiting request");
      event.waitUntil(
        self.skipWaiting().then(
          () => {
            responsePort?.postMessage({ success: true });
            console.info("Skipped waiting");
          },
          error => {
            responsePort?.postMessage({ error });
            console.error("Failed to skip waiting", error);
          },
        ),
      );
      break;
    }
    case "shutdown": {
      console.info("Received shutdown request");
      shuttingDown = true;
      responsePort?.postMessage({ success: true });
      break;
    }
  }
});

self.addEventListener("error", ({ error }) => {
  captureException(error);
});

self.addEventListener("unhandledrejection", ({ reason }) => {
  captureException(reason);
});

console.info("Service worker found with scope", self.registration.scope);
