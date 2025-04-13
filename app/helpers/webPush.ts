import { createContext, useContext } from "react";

import { type PushRegistration } from "~/types";

import { identifyVisitor } from "./fingerprinting";

const getPushManager = (): Promise<PushManager> =>
  navigator.serviceWorker.ready.then(({ pushManager }) => pushManager);

export const getPushSubscription = (): Promise<PushSubscription | null> =>
  getPushManager().then(pushManager => pushManager?.getSubscription() ?? null);

export interface UseWebPushResult {
  supported: boolean | undefined;
  subscription: PushSubscription | undefined | null;
  registration: PushRegistration | undefined | null;
  subscribed: boolean;
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
    setSupported(webPushSupported());
  }, []);
  return supported;
};

export const webPushSupported = (): boolean =>
  typeof window !== "undefined" && "Notification" in window;

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
  friendAccessToken?: string;
}

const registerSubscription = ({
  subscription,
  deviceId,
  deviceFingerprint,
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
  const unsubscribe = useCallback((): Promise<void> => {
    setUnsubscribing(true);
    return getPushSubscription()
      .then(
        subscription => {
          if (!subscription) {
            return;
          }
          return fetchRoute(routes.pushSubscriptions.unsubscribe, {
            descriptor: "unsubscribe from push notifications",
            data: {
              push_subscription: {
                endpoint: subscription.endpoint,
              },
            },
          })
            .then(() => subscription.unsubscribe())
            .then(() => {
              void mutateRoute(routes.pushSubscriptions.lookup, {
                query: currentFriend
                  ? { friend_token: currentFriend.access_token }
                  : undefined,
              });
              onUnsubscribed();
            });
        },
        (error: Error) => {
          setUnsubscribeError(error);
          throw error;
        },
      )
      .finally(() => {
        setUnsubscribing(false);
      });
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
  fetch("/device")
    .then(response => response.json())
    .then((data: { deviceId: string }) => get(data, "deviceId"));

export const useReregisterWithDeviceIdentifiers = (): void => {
  const { registration, subscribe } = useWebPush();
  useEffect(() => {
    if (
      registration &&
      (!registration.device_id || !registration.device_fingerprint)
    ) {
      void subscribe();
    }
  }, [registration]); // eslint-disable-line react-hooks/exhaustive-deps
};
