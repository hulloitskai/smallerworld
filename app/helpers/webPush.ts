import { createContext, useContext } from "react";

import { type PushRegistration } from "~/types";

import { isIos, useBrowserDetection } from "./browsers";
import { identifyVisitor } from "./fingerprinting";

const getPushManager = (): Promise<PushManager> =>
  navigator.serviceWorker.ready.then(({ pushManager }) => pushManager);

export const getPushSubscription = (): Promise<PushSubscription | null> =>
  navigator.serviceWorker.ready
    .then(({ pushManager }) => pushManager.getSubscription())
    .then(subscription => {
      if (
        subscription &&
        typeof subscription.expirationTime === "number" &&
        subscription.expirationTime <= Date.now()
      ) {
        console.warn("Found expired push subscription", subscription);
        return null;
      }
      return subscription;
    });

export interface UseWebPushResult {
  supported: boolean | undefined;
  subscription: PushSubscription | undefined | null;
  registration: PushRegistration | undefined | null;
  subscribe: () => Promise<void>;
  subscribing: boolean;
  subscribeError: Error | null;
  unsubscribe: () => Promise<void>;
  unsubscribing: boolean;
  unsubscribeError: Error | null;
  loading: boolean;
}

export const WebPushContext = createContext<UseWebPushResult | null>(null);

export interface WebPushOptions {
  onSubscribed?: () => void;
}

export const useWebPush = (options?: WebPushOptions): UseWebPushResult => {
  const context = useContext(WebPushContext);
  if (!context) {
    throw new Error("useWebPush must be used within a WebPushProvider");
  }
  return {
    ...context,
    subscribe: () =>
      context.subscribe().then(() => {
        options?.onSubscribed?.();
      }),
  };
};

export const useWebPushSupported = (): boolean | undefined => {
  const [supported, setSupported] = useState<boolean | undefined>();
  useEffect(() => {
    setSupported("Notification" in window);
  }, []);
  return supported;
};

export interface LookupPushRegistrationOptions {
  subscription: PushSubscription | undefined | null;
}

export const useLookupPushRegistration = ({
  subscription,
}: LookupPushRegistrationOptions): PushRegistration | undefined | null => {
  const currentFriend = useCurrentFriend();
  const { data } = useRouteSWR<{
    registration: PushRegistration | null;
  }>(routes.pushSubscriptions.lookup, {
    descriptor: "lookup push registration",
    ...(subscription
      ? {
          params: {
            query: currentFriend
              ? { friend_token: currentFriend.access_token }
              : undefined,
          },
          data: {
            push_subscription: {
              endpoint: subscription.endpoint,
            },
          },
          keepPreviousData: true,
          failSilently: true,
          onSuccess: ({ registration }) => {
            if (registration) {
              console.info("Loaded push registration", registration);
            }
          },
        }
      : {
          // This prevents the route from being called
          params: null,
        }),
    revalidateOnFocus: false,
  });
  const { registration } = data ?? {};
  return subscription === null ? subscription : registration;
};

export interface WebPushSubscribeOptions {
  onSubscribed: (subscription: PushSubscription) => void;
}

export const useWebPushSubscribe = ({
  onSubscribed,
}: WebPushSubscribeOptions): [
  () => Promise<void>,
  { subscribing: boolean; subscribeError: Error | null },
] => {
  const currentFriend = useCurrentFriend();
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<Error | null>(null);
  const subscribe = useCallback((): Promise<void> => {
    const subscribeAndRegister = async (): Promise<void> => {
      const [pushManager, publicKey, deviceId, visitorIdentity] =
        await Promise.all([
          getPushManager(),
          fetchPublicKey(),
          fetchDeviceId(),
          identifyVisitor(),
        ]);
      try {
        const subscription = await pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: createApplicationServerKey(publicKey),
        });
        try {
          await registerSubscription({
            subscription,
            deviceId,
            deviceFingerprint: visitorIdentity.visitorId,
            deviceFingerprintConfidence: visitorIdentity.confidence.score,
            friendAccessToken: currentFriend?.access_token,
          });
          onSubscribed(subscription);
        } catch (error) {
          if (error instanceof Error) {
            setSubscribeError(error);
            reportProblem(error.message);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          setSubscribeError(error);
          reportProblem(error.message);
        }
      } finally {
        setSubscribing(false);
      }
    };
    setSubscribing(true);
    if (Notification.permission === "granted") {
      return subscribeAndRegister();
    } else {
      return Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          return subscribeAndRegister();
        } else {
          setSubscribing(false);
        }
      });
    }
  }, [onSubscribed, currentFriend?.access_token]);
  return [subscribe, { subscribing, subscribeError }];
};

interface RegisterSubscriptionParams {
  subscription: PushSubscription;
  deviceId: string;
  deviceFingerprint: string;
  deviceFingerprintConfidence: number;
  friendAccessToken?: string;
}

const registerSubscription = ({
  subscription,
  deviceId,
  deviceFingerprint,
  deviceFingerprintConfidence,
  friendAccessToken,
}: RegisterSubscriptionParams): Promise<void> => {
  const { endpoint, keys } = pick(
    subscription.toJSON(),
    "endpoint",
    "keys.auth",
    "keys.p256dh",
  );
  if (!keys?.auth) {
    throw new Error("missing auth key");
  }
  if (!keys?.p256dh) {
    throw new Error("missing p256dh key");
  }
  const query = friendAccessToken ? { friend_token: friendAccessToken } : {};
  return fetchRoute<void>(routes.pushSubscriptions.create, {
    descriptor: "subscribe to push notifications",
    params: { query },
    data: {
      push_subscription: {
        endpoint,
        auth_key: keys.auth,
        p256dh_key: keys.p256dh,
      },
      push_registration: {
        device_id: deviceId,
        device_fingerprint: deviceFingerprint,
        device_fingerprint_confidence: deviceFingerprintConfidence,
      },
    },
  }).then(() => {
    void mutateRoute(routes.pushSubscriptions.lookup, { query });
  });
};

const reportProblem = (message: string): void => {
  toast.error("something went wrong", { description: message });
  console.error("Web push error", message);
};

export interface UseWebPushUnsubscribeOptions {
  onUnsubscribed: () => void;
}

export const useWebPushUnsubscribe = ({
  onUnsubscribed,
}: UseWebPushUnsubscribeOptions): [
  () => Promise<void>,
  { unsubscribing: boolean; unsubscribeError: Error | null },
] => {
  const currentFriend = useCurrentFriend();
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [unsubscribeError, setUnsubscribeError] = useState<Error | null>(null);
  const unsubscribe = useCallback(async (): Promise<void> => {
    setUnsubscribing(true);
    try {
      const subscription = await getPushSubscription();
      if (!subscription) {
        return;
      }
      await fetchRoute(routes.pushSubscriptions.unsubscribe, {
        descriptor: "unsubscribe from push notifications",
        data: {
          push_subscription: {
            endpoint: subscription.endpoint,
          },
        },
      });
      await subscription.unsubscribe();
      void mutateRoute(routes.pushSubscriptions.lookup, {
        query: currentFriend
          ? { friend_token: currentFriend.access_token }
          : undefined,
      });
      onUnsubscribed();
    } catch (error) {
      if (error instanceof Error) {
        setUnsubscribeError(error);
      }
      throw error;
    } finally {
      setUnsubscribing(false);
    }
  }, [onUnsubscribed, currentFriend?.access_token]); // eslint-disable-line react-hooks/exhaustive-deps
  return [unsubscribe, { unsubscribing, unsubscribeError }];
};

const createApplicationServerKey = (publicKey: string): Uint8Array =>
  Uint8Array.from(atob(publicKey), element => {
    const value = element.codePointAt(0);
    invariant(typeof value === "number");
    return value;
  });

const fetchPublicKey = (friendAccessToken?: string): Promise<string> => {
  const query = friendAccessToken
    ? { friend_token: friendAccessToken }
    : undefined;
  return fetchRoute<{ publicKey: string }>(routes.pushSubscriptions.publicKey, {
    descriptor: "load web push public key",
    params: { query },
  }).then(({ publicKey }) => publicKey);
};

const fetchDeviceId = (): Promise<string> =>
  navigator.serviceWorker.ready.then(() =>
    fetch("/device")
      .then(response => response.json())
      .then((data: { deviceId: string }) => get(data, "deviceId")),
  );

const RESET_PUSH_SUBSCRIPTION_ON_IOS_UNLESS_REGISTERED_AFTER =
  DateTime.fromObject({
    year: 2025,
    month: 4,
    day: 16,
    hour: 12,
  });

export const useResetPushSubscriptionOnIOS = (): void => {
  const browserDetection = useBrowserDetection();
  const isStandalone = useIsStandalone();
  const resubscribedRef = useRef(false);
  const { subscribe, unsubscribe, registration, loading } = useWebPush();
  useEffect(() => {
    if (
      browserDetection &&
      isIos(browserDetection) &&
      isStandalone &&
      registration?.created_at &&
      !loading &&
      !resubscribedRef.current
    ) {
      resubscribedRef.current = true;
      const registeredAt = DateTime.fromISO(registration.created_at);
      if (
        registeredAt < RESET_PUSH_SUBSCRIPTION_ON_IOS_UNLESS_REGISTERED_AFTER
      ) {
        void unsubscribe().then(subscribe);
      }
    }
  }, [!!browserDetection, !!isStandalone, registration?.created_at, loading]); // eslint-disable-line react-hooks/exhaustive-deps
};
