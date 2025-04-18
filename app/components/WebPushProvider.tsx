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
    subscription,
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
