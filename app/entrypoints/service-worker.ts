import { pick } from "lodash-es";
import invariant from "tiny-invariant";
import { v4 as uuid } from "uuid";

import {
  DEFAULT_NOTIFICATION_ICON_URL,
  notificationActionUrl,
  renderNotification,
} from "~/helpers/notifications";
import routes, { setupRoutes } from "~/helpers/routes";
import { type PushNotification } from "~/types";

declare const self: ServiceWorkerGlobalScope;

interface NotificationData {
  notification?: PushNotification;
  pageIconUrl?: string;
  test?: true;
  badgeCount?: number;
}

// == Setup
setupRoutes();

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

const disableNavigationPreloads = async () => {
  if (self.registration.navigationPreload) {
    // Disable navigation preloads!
    await self.registration.navigationPreload.disable();
  }
};

// == Skip waiting after install
self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

// == Claim clients
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([self.clients.claim(), disableNavigationPreloads()]),
  );
});

// == Device metadata server
const DEVICE_ENDPOINT = "/device";

self.addEventListener("fetch", event => {
  const { request } = event;

  // == Device metadata server
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

  // // == Respond to preloads.
  // event.waitUntil(
  //   event.preloadResponse.then((response: Response) => {
  //     if (response) {
  //       event.respondWith(response);
  //     }
  //   }),
  // );
});

// == Push handlers
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
  console.debug("notification clicked", event);
  event.notification.close(); // Android needs explicit close
  invariant(event.notification.data, "Missing notification data");
  const { notification } = event.notification.data as NotificationData;
  if (!notification) {
    return;
  }
  const actionUrl = notificationActionUrl(notification);
  const url = new URL(actionUrl, self.location.href).toString();
  console.debug("directing user to", url);
  event.waitUntil(
    // Open the target URL
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(clients => {
        // Check if there is already a window/tab open with the target path
        for (const client of clients) {
          if (pathname(client.url) !== pathname(url)) {
            continue;
          }
          // If so, focus it and go to the target URL
          return client.focus().then(client => {
            if (client.url !== url) {
              // NOTE: This doesn't seem to work?
              //
              // See: https://stackoverflow.com/questions/68949151/how-to-solve-service-worker-navigate-this-service-worker-is-not-the-clients-ac
              // return client.navigate(url);
              //
              // So instead, use postMessage to trigger client-side navigation
              client.postMessage({ action: "navigate", url });
            }
            return client;
          });
        }
        // If not, then open the target URL in a new window/tab.
        return self.clients.openWindow(url);
      }),
  );
});

console.info("Service worker installed with scope", self.registration.scope);
