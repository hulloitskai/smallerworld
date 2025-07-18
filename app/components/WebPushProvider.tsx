import { detectBrowser, isIos } from "~/helpers/browsers";
import {
  fingerprintDevice,
  type FingerprintingResult,
} from "~/helpers/fingerprinting";
import { type ServiceWorkerMetadata } from "~/helpers/serviceWorker";
import { fetchServiceWorkerMetadata } from "~/helpers/serviceWorker/client";
import {
  WebPushContext,
  type WebPushSubscribeOptions,
} from "~/helpers/webPush";
import { type PushRegistration } from "~/types";

export interface WebPushProviderProps extends PropsWithChildren {}

const WebPushProvider: FC<WebPushProviderProps> = ({ children }) => {
  const supported = useWebPushSupported();
  const [subscription, setSubscription] = useState<
    PushSubscription | undefined | null
  >();
  const subscriptionIfSupported = supported === null ? null : subscription;
  useDidUpdate(() => {
    if (!supported) {
      return;
    }
    console.info("Loading current push subscription...");
    void getPushSubscription().then(
      subscription => {
        setSubscription(subscription);
        console.info("Loaded current push subscription", subscription);
      },
      error => {
        setSubscription(null);
        console.error("Failed to load current push subscription", error);
        if (error instanceof Error) {
          toast.error("failed to load current push subscription", {
            description: error.message,
          });
        }
      },
    );
  }, [supported]);
  const registration = useLookupPushRegistration({
    subscription: subscriptionIfSupported,
  });
  const [subscribe, { subscribing, subscribeError }] = useWebPushSubscribe({
    currentSubscription: subscriptionIfSupported,
    onSubscribed: setSubscription,
  });
  const [unsubscribe, { unsubscribing, unsubscribeError }] =
    useWebPushUnsubscribe({
      subscription: subscriptionIfSupported,
      onUnsubscribed: () => {
        setSubscription(null);
      },
    });
  const loading = supported === undefined || subscribing || unsubscribing;
  return (
    <WebPushContext.Provider
      value={{
        supported,
        subscription: subscriptionIfSupported,
        registration,
        subscribe,
        subscribing,
        subscribeError,
        unsubscribe,
        unsubscribing,
        unsubscribeError,
        loading,
      }}
    >
      {children}
    </WebPushContext.Provider>
  );
};

export default WebPushProvider;

const useWebPushSupported = (): boolean | undefined => {
  const [supported, setSupported] = useState<boolean | undefined>();
  useEffect(() => {
    setSupported("Notification" in window);
  }, []);
  return supported;
};

const getPushManager = async (): Promise<PushManager> => {
  const { pushManager } = await navigator.serviceWorker.ready;
  return pushManager;
};

const getPushSubscription = (): Promise<PushSubscription | null | undefined> =>
  getPushManager().then(pushManager => pushManager?.getSubscription() ?? null);

interface LookupPushRegistrationOptions {
  subscription: PushSubscription | undefined | null;
}

const useLookupPushRegistration = ({
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
            query: {
              ...(currentFriend && {
                friend_token: currentFriend.access_token,
              }),
            },
          },
          data: {
            subscription: pick(subscription, "endpoint"),
          },
          keepPreviousData: true,
          failSilently: true,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          onSuccess: ({ registration }) => {
            if (registration) {
              console.info("Found push registration", registration);
            } else {
              console.info("No push registration found");
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
  return subscription === null ? null : registration;
};

interface WebPushSubscribeParams {
  currentSubscription: PushSubscription | null | undefined;
  onSubscribed: (subscription: PushSubscription) => void;
}

const useWebPushSubscribe = ({
  currentSubscription,
  onSubscribed,
}: WebPushSubscribeParams): [
  (options?: WebPushSubscribeOptions) => Promise<PushSubscription>,
  { subscribing: boolean; subscribeError: Error | null },
] => {
  const currentFriend = useCurrentFriend();
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<Error | null>(null);
  const subscribe = (
    options?: WebPushSubscribeOptions,
  ): Promise<PushSubscription> => {
    if (subscribing) {
      throw new Error("Already subscribing");
    }
    const { forceNewSubscription = false } = options ?? {};
    const subscribeAndRegister = async (): Promise<PushSubscription> => {
      const browserDetection = detectBrowser();
      let serviceWorkerMetadata: ServiceWorkerMetadata;
      let fingerprintingResult: FingerprintingResult;
      let subscription = currentSubscription;
      try {
        let pushManager: PushManager;
        let publicKey: string;
        [pushManager, publicKey, serviceWorkerMetadata, fingerprintingResult] =
          await Promise.all([
            getPushManager(),
            fetchPublicKey(),
            fetchServiceWorkerMetadata(),
            fingerprintDevice(),
          ]);
        if (forceNewSubscription && subscription && isIos(browserDetection)) {
          await subscription.unsubscribe();
        }
        if (!subscription || forceNewSubscription) {
          subscription = await pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: createApplicationServerKey(publicKey),
          });
        }
      } catch (error) {
        console.error("Web push error", error);
        if (error instanceof Error) {
          setSubscribeError(error);
          toast.error("failed to subscribe to push notifications", {
            description: error.message,
          });
        }
        throw error;
      }
      console.info("Identified device for push registartion", {
        deviceId: serviceWorkerMetadata.deviceId,
        fingerprintingResult,
      });
      await registerSubscription({
        subscription,
        deviceFingerprint: fingerprintingResult.fingerprint,
        deviceFingerprintConfidence: fingerprintingResult.confidenceScore,
        friendAccessToken: currentFriend?.access_token,
        ...serviceWorkerMetadata,
      });
      onSubscribed(subscription);
      return subscription;
    };
    setSubscribing(true);
    if (Notification.permission === "granted") {
      return subscribeAndRegister().finally(() => {
        setSubscribing(false);
      });
    } else {
      return Notification.requestPermission()
        .then(async permission => {
          if (permission !== "granted") {
            const error = new Error("Push notification permission not granted");
            setSubscribeError(error);
            throw error;
          }
          return subscribeAndRegister();
        })
        .finally(() => {
          setSubscribing(false);
        });
    }
  };
  return [subscribe, { subscribing, subscribeError }];
};

interface RegisterSubscriptionParams {
  subscription: PushSubscription;
  deviceId: string;
  serviceWorkerVersion: number;
  deviceFingerprint: string;
  deviceFingerprintConfidence: number;
  friendAccessToken?: string;
}

const registerSubscription = ({
  subscription,
  deviceId,
  serviceWorkerVersion,
  deviceFingerprint,
  deviceFingerprintConfidence,
  friendAccessToken,
}: RegisterSubscriptionParams): Promise<void> => {
  const { keys } = pick(subscription.toJSON(), "keys.auth", "keys.p256dh");
  if (!keys?.auth) {
    throw new Error("Missing push subscription auth key");
  }
  if (!keys?.p256dh) {
    throw new Error("Missing push subscription p256dh key");
  }
  const query = friendAccessToken ? { friend_token: friendAccessToken } : {};
  return fetchRoute<{ registration: PushRegistration }>(
    routes.pushSubscriptions.create,
    {
      descriptor: "subscribe to push notifications",
      params: { query },
      data: {
        subscription: {
          endpoint: subscription.endpoint,
          auth_key: keys.auth,
          p256dh_key: keys.p256dh,
        },
        registration: {
          device_id: deviceId,
          device_fingerprint: deviceFingerprint,
          device_fingerprint_confidence: deviceFingerprintConfidence,
          service_worker_version: serviceWorkerVersion,
        },
      },
    },
  ).then(() => {
    void mutateRoute(routes.pushSubscriptions.lookup, { query });
  });
};

export interface WebPushUnsubscribeParams {
  subscription: PushSubscription | null | undefined;
  onUnsubscribed: () => void;
}

const useWebPushUnsubscribe = ({
  subscription,
  onUnsubscribed,
}: WebPushUnsubscribeParams): [
  () => Promise<void>,
  { unsubscribing: boolean; unsubscribeError: Error | null },
] => {
  const currentFriend = useCurrentFriend();
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [unsubscribeError, setUnsubscribeError] = useState<Error | null>(null);
  const unsubscribe = async (): Promise<void> => {
    if (!subscription) {
      throw new Error("No current subscription");
    }
    if (unsubscribing) {
      throw new Error("Already unsubscribing");
    }
    setUnsubscribing(true);
    try {
      const { shouldRemoveSubscription } = await fetchRoute<{
        shouldRemoveSubscription: boolean;
      }>(routes.pushSubscriptions.unsubscribe, {
        descriptor: "unsubscribe from push notifications",
        params: {
          query: {
            ...(currentFriend && {
              friend_token: currentFriend.access_token,
            }),
          },
        },
        data: {
          subscription: {
            endpoint: subscription.endpoint,
          },
        },
      });
      if (shouldRemoveSubscription) {
        await subscription.unsubscribe();
      }
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
  };
  return [unsubscribe, { unsubscribing, unsubscribeError }];
};

const createApplicationServerKey = (publicKey: string): Uint8Array =>
  Uint8Array.from(atob(publicKey), element => {
    const value = element.codePointAt(0);
    invariant(typeof value === "number", "Failed to parse public key");
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
