import { type GetResult } from "@fingerprintjs/fingerprintjs";

import { identifyVisitor } from "~/helpers/fingerprinting";
import { WebPushContext } from "~/helpers/webPush";
import { type PushRegistration } from "~/types";

export interface WebPushProviderProps extends PropsWithChildren {}

const WebPushProvider: FC<WebPushProviderProps> = ({ children }) => {
  const supported = useWebPushSupported();
  const [subscriptionIfSupported, setSubscription] = useState<
    PushSubscription | undefined | null
  >();
  const subscription = supported === null ? null : subscriptionIfSupported;
  useDidUpdate(() => {
    if (!supported) {
      return;
    }
    setTimeout(() => {
      void getPushSubscription().then(setSubscription, error => {
        setSubscription(null);
        console.error("Failed to get current push subscription", error);
        if (error instanceof Error) {
          toast.error("failed to get current push subscription", {
            description: error.message,
          });
        }
      });
    }, 2000);
  }, [supported]);
  const registration = useLookupPushRegistration({ subscription });
  const [subscribe, { subscribing, subscribeError }] = useWebPushSubscribe({
    currentSubscription: subscription,
    onSubscribed: setSubscription,
  });
  const [unsubscribe, { unsubscribing, unsubscribeError }] =
    useWebPushUnsubscribe({
      subscription,
      onUnsubscribed: () => {
        setSubscription(null);
      },
    });
  const loading = supported === undefined || subscribing || unsubscribing;
  return (
    <WebPushContext.Provider
      value={{
        supported,
        subscription,
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

const getPushSubscription = (): Promise<PushSubscription | null> =>
  getPushManager().then(pushManager => pushManager.getSubscription());

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

interface WebPushSubscribeOptions {
  currentSubscription: PushSubscription | null | undefined;
  onSubscribed: (subscription: PushSubscription) => void;
}

const useWebPushSubscribe = ({
  currentSubscription,
  onSubscribed,
}: WebPushSubscribeOptions): [
  () => Promise<void>,
  { subscribing: boolean; subscribeError: Error | null },
] => {
  const currentFriend = useCurrentFriend();
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<Error | null>(null);
  const subscribe = (): Promise<void> => {
    const subscribeAndRegister = async (): Promise<void> => {
      let deviceId: string | undefined;
      let visitorIdentity: GetResult | undefined;
      let subscription: PushSubscription | undefined;
      try {
        let pushManager: PushManager | undefined;
        let publicKey: string | undefined;
        [pushManager, publicKey, deviceId, visitorIdentity] = await Promise.all(
          [
            getPushManager(),
            fetchPublicKey(),
            fetchDeviceId(),
            identifyVisitor(),
            currentSubscription?.unsubscribe(),
          ],
        );
        subscription = await pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: createApplicationServerKey(publicKey),
        });
      } catch (error) {
        if (error instanceof Error) {
          setSubscribeError(error);
          reportProblem(error.message);
        }
      }
      if (!(deviceId && visitorIdentity && subscription)) {
        return;
      }
      await registerSubscription({
        subscription,
        deviceId,
        deviceFingerprint: visitorIdentity.visitorId,
        deviceFingerprintConfidence: visitorIdentity.confidence.score,
        friendAccessToken: currentFriend?.access_token,
      });
      onSubscribed(subscription);
    };
    setSubscribing(true);
    if (Notification.permission === "granted") {
      return subscribeAndRegister().finally(() => {
        setSubscribing(false);
      });
    } else {
      return Notification.requestPermission()
        .then(async permission => {
          if (permission === "granted") {
            await subscribeAndRegister();
          }
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
  subscription: PushSubscription | null | undefined;
  onUnsubscribed: () => void;
}

const useWebPushUnsubscribe = ({
  subscription,
  onUnsubscribed,
}: UseWebPushUnsubscribeOptions): [
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
    setUnsubscribing(true);
    try {
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
  };
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

const fetchDeviceId = async (): Promise<string> => {
  await navigator.serviceWorker.ready;
  const response = await fetch("/device");
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch device id (status code ${response.status})`,
    );
  }
  const data: { deviceId: string } = await response.json();
  return data.deviceId;
};
