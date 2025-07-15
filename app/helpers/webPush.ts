import { createContext, useCallback, useContext } from "react";

import { type PushRegistration } from "~/types";

import { useDeviceFingerprint } from "./fingerprinting";
import { useServiceWorkerMetadata } from "./serviceWorker/client";

export interface WebPushSubscribeOptions {
  forceNewSubscription?: boolean;
}

export interface WebPush {
  supported: boolean | undefined;
  subscription: PushSubscription | undefined | null;
  registration: PushRegistration | undefined | null;
  subscribe: (options?: WebPushSubscribeOptions) => Promise<PushSubscription>;
  subscribing: boolean;
  subscribeError: Error | null;
  unsubscribe: () => Promise<void>;
  unsubscribing: boolean;
  unsubscribeError: Error | null;
  loading: boolean;
}

export const WebPushContext = createContext<WebPush | null>(null);

export interface WebPushOptions {
  onSubscribed?: (subscription: PushSubscription) => void;
}

export const useWebPush = (options?: WebPushOptions): WebPush => {
  const context = useContext(WebPushContext);
  if (!context) {
    throw new Error("useWebPush must be used within a WebPushProvider");
  }
  return {
    ...context,
    subscribe: (subscribeOptions?: WebPushSubscribeOptions) =>
      context.subscribe(subscribeOptions).then(subscription => {
        options?.onSubscribed?.(subscription);
        return subscription;
      }),
  };
};

export interface SendTestNotificationReturn {
  send: (subscription: PushSubscription) => Promise<void>;
  sent: boolean;
  sending: boolean;
}

export const useSendTestNotification = (): SendTestNotificationReturn => {
  const currentFriend = useCurrentFriend();
  const { trigger, mutating, data } = useRouteMutation(
    routes.pushSubscriptions.test,
    {
      descriptor: "send test notification",
      params: {
        query: {
          ...(currentFriend && {
            friend_token: currentFriend.access_token,
          }),
        },
      },
    },
  );
  const send = useCallback(
    async (subscription: PushSubscription) => {
      await trigger({
        subscription: {
          endpoint: subscription.endpoint,
        },
      });
    },
    [trigger],
  );
  return {
    send,
    sent: !!data,
    sending: mutating,
  };
};

export const useReregisterPushSubscriptionIfNeeded = (): void => {
  const { registration, loading, subscribe } = useWebPush();
  const serviceWorkerMetadata = useServiceWorkerMetadata();
  const deviceFingerprint = useDeviceFingerprint();
  useEffect(() => {
    if (
      loading ||
      !registration ||
      !serviceWorkerMetadata ||
      !deviceFingerprint
    ) {
      return;
    }
    if (
      registration.service_worker_version !==
      serviceWorkerMetadata.serviceWorkerVersion
    ) {
      console.info(
        "Service worker version mismatch; re-registering push subscription...",
      );
      void subscribe();
    } else if (
      deviceFingerprint.fingerprint !== registration.device_fingerprint
    ) {
      console.info(
        "Device fingerprint mismatch; re-registering push subscription...",
      );
      void subscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registration, serviceWorkerMetadata, deviceFingerprint, loading]);
};
