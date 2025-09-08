import { detectBrowser, isIos } from "~/helpers/browsers";
import {
  fingerprintDevice,
  type FingerprintingResult,
} from "~/helpers/fingerprinting";
import { type ServiceWorkerMetadata } from "~/helpers/serviceWorker";
import { getServiceWorkerMetadata } from "~/helpers/serviceWorker/client";
import {
  PUSH_PERMISSION_NOT_GRANTED,
  WebPushContext,
  type WebPushSubscribeOptions,
} from "~/helpers/webPush";
import { type PushRegistration } from "~/types";

export interface WebPushProviderProps extends PropsWithChildren {}

const WebPushProvider: FC<WebPushProviderProps> = ({ children }) => {
  const supported = useWebPushSupported();
  const permission = useWebPushPermission();
  const [pushSubscription, setPushSubscription] = useState<
    PushSubscription | undefined | null
  >();
  const pushSubscriptionIfSupported =
    supported === null ? null : pushSubscription;
  useDidUpdate(() => {
    if (!supported) {
      return;
    }
    console.info("Loading current push subscription...");
    void getPushSubscription().then(
      pushSubscription => {
        setPushSubscription(pushSubscription);
        console.info("Current push subscription", pushSubscription);
      },
      reason => {
        setPushSubscription(null);
        console.error("Failed to load current push subscription", reason);
        if (reason instanceof Error) {
          toast.error("failed to load current push subscription", {
            description: reason.message,
          });
        }
      },
    );
  }, [supported]);
  const pushRegistration = useLookupPushRegistration({
    pushSubscription: pushSubscriptionIfSupported,
  });
  const [subscribe, { subscribing, subscribeError }] = useWebPushSubscribe({
    currentPushSubscription: pushSubscriptionIfSupported,
    onSubscribed: setPushSubscription,
  });
  const [unsubscribe, { unsubscribing, unsubscribeError }] =
    useWebPushUnsubscribe({
      pushSubscription: pushSubscriptionIfSupported,
      onUnsubscribed: () => {
        setPushSubscription(null);
      },
    });
  const loading = supported === undefined || subscribing || unsubscribing;
  return (
    <WebPushContext.Provider
      value={{
        supported,
        permission,
        pushSubscription: pushSubscriptionIfSupported,
        pushRegistration,
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

const useWebPushPermission = (): NotificationPermission | null | undefined => {
  const [permission, setPermission] = useState<
    NotificationPermission | null | undefined
  >(undefined);
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      const permissionRef: { current: PermissionStatus | null } = {
        current: null,
      };
      const handlePermissionChange = () => {
        setPermission(Notification.permission);
      };
      void navigator.permissions
        .query({ name: "notifications" })
        .then(permission => {
          permissionRef.current = permission;
          permission.addEventListener("change", handlePermissionChange);
        });
      return () => {
        const permission = permissionRef.current;
        if (permission) {
          permission.removeEventListener("change", handlePermissionChange);
        }
      };
    } else {
      setPermission(null);
    }
  }, []);
  return permission;
};

const getPushManager = async (): Promise<PushManager> => {
  const { pushManager } = await navigator.serviceWorker.ready;
  return pushManager;
};

const getPushSubscription = (): Promise<PushSubscription | null | undefined> =>
  getPushManager().then(pushManager => pushManager?.getSubscription() ?? null);

interface LookupPushRegistrationOptions {
  pushSubscription: PushSubscription | undefined | null;
}

const useLookupPushRegistration = ({
  pushSubscription,
}: LookupPushRegistrationOptions): PushRegistration | undefined | null => {
  const currentFriend = useCurrentFriend();
  const { data } = useRouteSWR<{
    pushRegistration: PushRegistration | null;
  }>(routes.pushSubscriptions.lookup, {
    descriptor: "lookup push registration",
    ...(pushSubscription
      ? {
          params: {
            query: {
              ...(currentFriend && {
                friend_token: currentFriend.access_token,
              }),
            },
          },
          data: {
            push_subscription: pick(pushSubscription, "endpoint"),
          },
          keepPreviousData: true,
          failSilently: true,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          onSuccess: ({ pushRegistration }) => {
            if (pushRegistration) {
              console.info("Found push registration", pushRegistration);
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
  const { pushRegistration } = data ?? {};
  return pushSubscription === null ? null : pushRegistration;
};

interface WebPushSubscribeParams {
  currentPushSubscription: PushSubscription | null | undefined;
  onSubscribed: (subscription: PushSubscription) => void;
}

const useWebPushSubscribe = ({
  currentPushSubscription,
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
    console.debug("Requested to subscribe to push notifications", {
      currentPushSubscription,
    });
    if (subscribing) {
      throw new Error("Already subscribing to push notifications");
    }
    const { forceNewSubscription = false } = options ?? {};
    const subscribeAndRegister = async (): Promise<PushSubscription> => {
      const browserDetection = detectBrowser();
      let serviceWorkerMetadata: ServiceWorkerMetadata;
      let fingerprintingResult: FingerprintingResult;
      let pushSubscription = currentPushSubscription;
      try {
        let pushManager: PushManager;
        let publicKey: string;
        [pushManager, serviceWorkerMetadata, publicKey, fingerprintingResult] =
          await Promise.all([
            getPushManager(),
            getServiceWorkerMetadata(),
            fetchPublicKey(),
            fingerprintDevice(),
          ]);
        if (
          forceNewSubscription &&
          pushSubscription &&
          isIos(browserDetection)
        ) {
          console.debug("Unsubscribing from existing push subscription", {
            forceNewSubscription,
            currentPushSubscription,
          });
          await pushSubscription.unsubscribe();
        }
        if (!pushSubscription || forceNewSubscription) {
          console.debug("Creating new push subscription...");
          pushSubscription = await pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: createApplicationServerKey(publicKey),
          });
          console.debug("New push subscription", { pushSubscription });
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
      const registrationParams: RegisterPushSubscriptionParams = {
        pushSubscription,
        deviceFingerprint: fingerprintingResult.fingerprint,
        deviceFingerprintConfidence: fingerprintingResult.confidenceScore,
        friendAccessToken: currentFriend?.access_token,
        ...serviceWorkerMetadata,
      };
      console.debug("Registering push subscription", registrationParams);
      const pushRegistration =
        await registerPushSubscription(registrationParams);
      console.info("Registered push subscription", { pushRegistration });
      onSubscribed(pushSubscription);
      return pushSubscription;
    };
    setSubscribing(true);
    if (Notification.permission === "granted") {
      console.debug(
        "Push notification permission already granted; subscribing...",
      );
      return subscribeAndRegister().finally(() => {
        setSubscribing(false);
      });
    } else {
      return Notification.requestPermission()
        .then(async permission => {
          if (permission !== "granted") {
            const error = PUSH_PERMISSION_NOT_GRANTED;
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

interface RegisterPushSubscriptionParams {
  pushSubscription: PushSubscription;
  deviceId: string;
  serviceWorkerVersion: number;
  deviceFingerprint: string;
  deviceFingerprintConfidence: number;
  friendAccessToken?: string;
}

const registerPushSubscription = ({
  pushSubscription,
  deviceId,
  serviceWorkerVersion,
  deviceFingerprint,
  deviceFingerprintConfidence,
  friendAccessToken,
}: RegisterPushSubscriptionParams): Promise<PushRegistration> => {
  const { keys } = pick(pushSubscription.toJSON(), "keys.auth", "keys.p256dh");
  if (!keys?.auth) {
    throw new Error("Missing push subscription auth key");
  }
  if (!keys?.p256dh) {
    throw new Error("Missing push subscription p256dh key");
  }
  const query = friendAccessToken ? { friend_token: friendAccessToken } : {};
  return fetchRoute<{ pushRegistration: PushRegistration }>(
    routes.pushSubscriptions.create,
    {
      descriptor: "subscribe to push notifications",
      params: { query },
      data: {
        push_subscription: {
          endpoint: pushSubscription.endpoint,
          auth_key: keys.auth,
          p256dh_key: keys.p256dh,
          service_worker_version: serviceWorkerVersion,
        },
        push_registration: {
          device_id: deviceId,
          device_fingerprint: deviceFingerprint,
          device_fingerprint_confidence: deviceFingerprintConfidence,
        },
      },
    },
  ).then(({ pushRegistration }) => {
    void mutateRoute(routes.pushSubscriptions.lookup, { query });
    return pushRegistration;
  });
};

export interface WebPushUnsubscribeParams {
  pushSubscription: PushSubscription | null | undefined;
  onUnsubscribed: () => void;
}

const useWebPushUnsubscribe = ({
  pushSubscription,
  onUnsubscribed,
}: WebPushUnsubscribeParams): [
  () => Promise<void>,
  { unsubscribing: boolean; unsubscribeError: Error | null },
] => {
  const currentFriend = useCurrentFriend();
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [unsubscribeError, setUnsubscribeError] = useState<Error | null>(null);
  const unsubscribe = async (): Promise<void> => {
    if (!pushSubscription) {
      throw new Error("No current push subscription");
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
          push_subscription: {
            endpoint: pushSubscription.endpoint,
          },
        },
      });
      if (shouldRemoveSubscription) {
        await pushSubscription.unsubscribe();
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

const fetchPublicKey = (friendAccessToken?: string): Promise<string> =>
  fetchRoute<{ publicKey: string }>(routes.pushSubscriptions.publicKey, {
    descriptor: "load web push public key",
    params: {
      query: {
        ...(friendAccessToken && { friend_token: friendAccessToken }),
      },
    },
  }).then(({ publicKey }) => publicKey);
