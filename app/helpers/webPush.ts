import { createContext, useContext } from "react";

import { type PushRegistration } from "~/types";

import { isIos, useBrowserDetection } from "./browsers";

export interface UseWebPushResult {
  supported: boolean | undefined;
  subscription: PushSubscription | undefined | null;
  registration: PushRegistration | undefined | null;
  subscribe: () => Promise<PushSubscription>;
  subscribing: boolean;
  subscribeError: Error | null;
  unsubscribe: () => Promise<void>;
  unsubscribing: boolean;
  unsubscribeError: Error | null;
  loading: boolean;
}

export const WebPushContext = createContext<UseWebPushResult | null>(null);

export interface WebPushOptions {
  onSubscribed?: (subscription: PushSubscription) => void;
}

export const useWebPush = (options?: WebPushOptions): UseWebPushResult => {
  const context = useContext(WebPushContext);
  if (!context) {
    throw new Error("useWebPush must be used within a WebPushProvider");
  }
  return {
    ...context,
    subscribe: () =>
      context.subscribe().then(subscription => {
        options?.onSubscribed?.(subscription);
        return subscription;
      }),
  };
};

const RESET_PUSH_SUBSCRIPTION_ON_IOS_UNLESS_REGISTERED_AFTER =
  DateTime.fromObject(
    { year: 2025, month: 4, day: 24, hour: 20 },
    { zone: "America/Toronto" },
  );

export const useResetPushSubscriptionOnIOS = (): void => {
  const browserDetection = useBrowserDetection();
  const isStandalone = useIsStandalone();
  const resubscribedRef = useRef(false);
  const { subscribe, registration, loading } = useWebPush();
  useEffect(() => {
    if (
      browserDetection &&
      isIos(browserDetection) &&
      isStandalone &&
      registration &&
      !loading &&
      !resubscribedRef.current
    ) {
      resubscribedRef.current = true;
      const registeredAt = DateTime.fromISO(registration.created_at);
      if (
        registeredAt < RESET_PUSH_SUBSCRIPTION_ON_IOS_UNLESS_REGISTERED_AFTER
      ) {
        void subscribe().then(() => {
          console.info("Re-subscribed to push notifications");
        });
      }
    }
  }, [browserDetection, isStandalone, registration, loading]); // eslint-disable-line react-hooks/exhaustive-deps
};
