import { createContext, useContext } from "react";

import { type PushRegistration } from "~/types";

import { getOrRegisterServiceWorker } from "./serviceWorker";

const getPushManager = (): Promise<PushManager> =>
  getOrRegisterServiceWorker().then(({ pushManager }) => pushManager);

export const getPushSubscription = (): Promise<PushSubscription | null> =>
  getPushManager().then(pushManager => pushManager.getSubscription());

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

export const useWebPush = (): UseWebPushResult => {
  const context = useContext(WebPushContext);
  if (!context) {
    throw new Error("useWebPush must be used within a WebPushProvider");
  }
  return context;
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
        }
      : {
          // This prevents the route from being called
          params: null,
        }),
  });
  const { registration } = data ?? {};
  return subscription === null ? null : registration;
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
    const subscribeAndRegister = (): Promise<void> =>
      Promise.all<[Promise<PushManager>, Promise<string>]>([
        getPushManager(),
        fetchPublicKey(),
      ])
        .then(
          ([pushManager, publicKey]) =>
            pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: createApplicationServerKey(publicKey),
            }),
          (error: Error): never => {
            setSubscribeError(error);
            return reportProblem(error.message);
          },
        )
        .then(
          subscription =>
            registerSubscription(subscription, currentFriend?.access_token)
              .then()
              .then(
                () => {
                  onSubscribed(subscription);
                },
                (error: Error) => {
                  reportProblem(error.message);
                },
              ),
          (error: Error) => {
            setSubscribeError(error);
            toast.error("couldn't subscribe to push notifications", {
              description: error.message,
            });
            throw error;
          },
        )
        .finally(() => {
          setSubscribing(false);
        });
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

const registerSubscription = (
  subscription: PushSubscription,
  friendAccessToken?: string,
): Promise<void> => {
  const { endpoint, keys } = pick(
    subscription.toJSON(),
    "endpoint",
    "keys.auth",
    "keys.p256dh",
  );
  if (!keys?.auth) {
    throw new Error("Missing auth key");
  }
  if (!keys?.p256dh) {
    throw new Error("Missing p256dh key");
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
    },
  }).then(() => {
    mutateRoute(routes.pushSubscriptions.lookup, { query });
  });
};

const reportProblem = (message: string): never => {
  toast.error("something went wrong", {
    description: message,
  });
  console.error(message);
  throw new Error(message);
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
              mutateRoute(routes.pushSubscriptions.lookup, {
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
