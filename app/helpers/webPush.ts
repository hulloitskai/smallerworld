import { pick } from "lodash-es";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { type PushRegistration } from "~/types";

import { useCurrentFriend } from "./authentication";
import { useDeviceFingerprint } from "./fingerprinting";
import routes from "./routes";
import { useRouteMutation } from "./routes/swr";
import { useServiceWorkerMetadata } from "./serviceWorker/client";

export const PUSH_PERMISSION_NOT_GRANTED = new Error(
  "Push notification permission not granted",
);

export interface WebPushSubscribeOptions {
  forceNewSubscription?: boolean;
}

export interface WebPush {
  supported: boolean | undefined;
  permission: NotificationPermission | null | undefined;
  pushSubscription: PushSubscription | undefined | null;
  pushRegistration: PushRegistration | undefined | null;
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
  send: (pushSubscription: PushSubscription) => Promise<void>;
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
      serializeData: attributes => ({ push_subscription: attributes }),
    },
  );
  const send = useCallback(
    async (pushSubscription: PushSubscription) => {
      await trigger(pick(pushSubscription, "endpoint"));
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
  const { pushRegistration, loading, subscribe } = useWebPush();
  const serviceWorkerMetadata = useServiceWorkerMetadata();
  const deviceFingerprint = useDeviceFingerprint();
  const registrationAttemptedRef = useRef(false);
  useEffect(() => {
    if (
      registrationAttemptedRef.current ||
      loading ||
      !pushRegistration ||
      !serviceWorkerMetadata ||
      !deviceFingerprint
    ) {
      return;
    }
    if (
      pushRegistration.service_worker_version !==
      serviceWorkerMetadata.serviceWorkerVersion
    ) {
      console.info(
        "Service worker version mismatch; re-registering push subscription...",
      );
      registrationAttemptedRef.current = true;
      void subscribe();
    } else if (
      deviceFingerprint.fingerprint !== pushRegistration.device_fingerprint
    ) {
      console.info(
        "Device fingerprint mismatch; re-registering push subscription...",
      );
      registrationAttemptedRef.current = true;
      void subscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushRegistration, serviceWorkerMetadata, deviceFingerprint, loading]);
};
