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
import { type PushNotification } from "~/types";

declare const self: ServiceWorkerGlobalScope;
const manifest = self.__WB_MANIFEST;

// == Setup
setupRoutes();
enableNavigationPreload();
if (!isEmpty(manifest)) {
  console.info("Precaching routes", manifest);
}
precacheAndRoute(manifest, { cleanURLs: false });
registerRoute(
  ({ request }) => request.destination === "document",
  new NetworkOnly(),
);
cleanupOutdatedCaches();

// == Lifecycle
self.addEventListener("install", event => {
  console.info("Service worker installing");
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", event => {
  console.info("Service worker activating (claiming clients)");
  event.waitUntil(self.clients.claim());
});

// == Helpers
const markAsDelivered = (notification: PushNotification): Promise<void> =>
  routes.notifications
    .delivered<{}>({
      params: { id: notification.id },
      data: { notification: pick(notification, "delivery_token") },
    })
    .then(() => {
      console.info(`Marked notification '${notification.id}' as delivered`);
    })
    .catch(error => {
      console.error(
        `Failed to mark notification '${notification.id}' as delivered`,
        error,
      );
    });

const pathname = (url: string): string => {
  const u = new URL(url, self.location.href);
  return u.pathname;
};

// == Device metadata server
const DEVICE_ENDPOINT = "/device";
self.addEventListener("fetch", event => {
  const { request } = event;
  if (pathname(request.url) === DEVICE_ENDPOINT) {
    console.debug("Device metadata request intercepted", request.url);
    event.respondWith(
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
    return;
  }
});

// == Push handlers
interface NotificationData {
  notification?: PushNotification;
  pageIconUrl?: string;
  test?: true;
  badgeCount?: number;
}

self.addEventListener("push", event => {
  invariant(event.data, "Missing push data");
  const data = event.data.json() as NotificationData;
  if (import.meta.env.RAILS_ENV === "development") {
    console.debug("Push event", data);
  }
  const { notification, pageIconUrl, badgeCount } = data;
  const actions: Promise<void>[] = [];

  // Set app badge if no window is currently visible.
  if (badgeCount && navigator.setAppBadge) {
    console.debug("Setting app badge", badgeCount);
    actions.push(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then(async clients => {
          if (clients.every(client => client.visibilityState === "hidden")) {
            await navigator.setAppBadge(badgeCount);
          }
        }),
    );
  }

  if (notification) {
    const { title, icon, ...options } = renderNotification(notification);
    actions.push(
      self.registration
        .showNotification(title, {
          ...options,
          icon: icon ?? pageIconUrl ?? DEFAULT_NOTIFICATION_ICON_URL,
          data,
        })
        .then(() => markAsDelivered(notification)),
    );
  } else {
    actions.push(
      self.registration.showNotification("test notification", {
        body: "this is a test notification. if you are seeing this, then your push notifications are working!",
        icon: pageIconUrl ?? DEFAULT_NOTIFICATION_ICON_URL,
      }),
    );
  }
  event.waitUntil(Promise.all(actions));
});

self.addEventListener("pushsubscriptionchange", event => {
  const changeEvent = event as PushSubscriptionChangeEvent;
  const { newSubscription, oldSubscription } = changeEvent;
  const newSubscriptionJSON = newSubscription?.toJSON();
  changeEvent.waitUntil(
    routes.pushSubscriptions
      .change({
        data: {
          old_subscription: oldSubscription
            ? { endpoint: oldSubscription.endpoint }
            : null,
          new_subscription: newSubscriptionJSON
            ? {
                endpoint: newSubscriptionJSON.endpoint,
                p256dh_key: newSubscriptionJSON.keys?.p256dh,
                auth_key: newSubscriptionJSON.keys?.auth,
              }
            : null,
        },
      })
      .catch(error => {
        console.error("Failed to change push subscription", error);
      }),
  );
});

self.addEventListener("notificationclick", event => {
  console.debug("Notification clicked", event);
  event.notification.close(); // Android needs explicit close

  invariant(event.notification.data, "Missing notification data");
  const { notification } = event.notification.data as NotificationData;
  if (!notification) {
    return;
  }

  const targetUrl = notificationTargetUrl(notification);
  console.debug("Requesting navigation to", targetUrl);

  // Open the target URL
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then(async clients => {
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

console.info("Service worker found with scope", self.registration.scope);
