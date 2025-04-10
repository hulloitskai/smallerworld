import {
  getPushSubscription,
  useLookupPushRegistration,
  useWebPushSubscribe,
  useWebPushSupported,
  useWebPushUnsubscribe,
  WebPushContext,
} from "~/helpers/webPush";

export interface WebPushProviderProps extends PropsWithChildren {}

const WebPushProvider: FC<WebPushProviderProps> = ({ children }) => {
  const supported = useWebPushSupported();
  const [subscription, setSubscription] = useState<
    PushSubscription | undefined | null
  >();
  useDidUpdate(() => {
    if (supported) {
      void getPushSubscription().then(setSubscription, error => {
        setSubscription(null);
        console.error("Failed to get current push subscription", error);
        if (error instanceof Error) {
          toast.error("failed to get current push subscription", {
            description: error.message,
          });
        }
      });
    } else if (supported === false) {
      setSubscription(null);
    }
  }, [supported]);
  const registration = useLookupPushRegistration({
    subscription,
  });
  const [subscribe, { subscribing, subscribeError }] = useWebPushSubscribe({
    onSubscribed: setSubscription,
  });
  const [unsubscribe, { unsubscribing, unsubscribeError }] =
    useWebPushUnsubscribe({
      onUnsubscribed: () => {
        setSubscription(null);
      },
    });
  const loading = supported === null || subscribing || unsubscribing;
  return (
    <WebPushContext.Provider
      value={{
        supported,
        subscription,
        registration,
        subscribed: !!subscription,
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
