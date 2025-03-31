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
  page_icon_url?: string;
  test?: true;
  badge_count?: number;
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

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    // Enable navigation preloads!
    await self.registration.navigationPreload.enable();
  }
};

// == Claim clients
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([self.clients.claim(), enableNavigationPreload()]),
  );
});

// == Device metadata server
const DEVICE_ENDPOINT = "/device";

self.addEventListener("fetch", event => {
  const { request, preloadResponse } = event;

  // == Device metadata server
  if (pathname(request.url) === DEVICE_ENDPOINT) {
    console.debug("Device metadata request intercepted", request.url);
    return event.respondWith(
      caches.open(DEVICE_ENDPOINT).then(cache =>
        cache.match(request).then(response => {
          if (response) {
            return response;
          }
          const payload = { deviceId: uuid() };
          response = new Response(JSON.stringify(payload), {
            headers: { "Content-Type": "application/json" },
          });
          return cache.put(request, response).then(() => response);
        }),
      ),
    );
  }

  // == Regular responses
  return event.respondWith(
    preloadResponse.then((response: Response | undefined) => {
      if (response) {
        return response;
      }
      return fetch(request);
    }),
  );
});

// == Push handlers
self.addEventListener("push", event => {
  invariant(event.data, "Missing push data");
  const data = event.data.json() as NotificationData;
  if (import.meta.env.RAILS_ENV === "development") {
    console.debug("Push event", data);
  }
  const { notification, page_icon_url, badge_count } = data;
  const actions: Promise<void>[] = [];

  // Set app badge if no window is currently visible.
  if (badge_count && navigator.setAppBadge) {
    console.debug("Setting app badge", badge_count);
    actions.push(
      self.clients.matchAll({ type: "window" }).then(clients => {
        if (!clients.some(client => client.visibilityState === "visible")) {
          return navigator.setAppBadge(badge_count);
        }
        return Promise.resolve();
      }),
    );
  }

  if (notification) {
    const { title, icon, ...options } = renderNotification(notification);
    actions.push(
      self.registration
        .showNotification(title, {
          ...options,
          icon: icon ?? page_icon_url ?? DEFAULT_NOTIFICATION_ICON_URL,
          data,
        })
        .then(() => markAsDelivered(notification)),
    );
  } else {
    actions.push(
      self.registration.showNotification("test notification", {
        body: "this is a test notification. if you are seeing this, then your push notifications are working!",
        icon: page_icon_url ?? DEFAULT_NOTIFICATION_ICON_URL,
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
    routes.pushSubscriptions.change({
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
  const actionUrl = notificationActionUrl(notification);
  const url = new URL(actionUrl, self.location.href).toString();
  console.debug("Directing user to", url);
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
