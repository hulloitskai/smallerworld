import {
  getPushSubscription,
  useLookupPushRegistration,
  useWebPushSubscribe,
  useWebPushSupported,
  useWebPushUnsubscribe,
  WebPushContext,
} from "~/helpers/webPush";

export interface WebPushProviderProps extends PropsWithChildren {
  friendAccessToken?: string;
}

const WebPushProvider: FC<WebPushProviderProps> = ({
  children,
  friendAccessToken,
}) => {
  const supported = useWebPushSupported();
  const [subscription, setSubscription] = useState<
    PushSubscription | undefined | null
  >();
  useEffect(() => {
    if (supported) {
      void getPushSubscription().then(setSubscription, (error: Error) => {
        setSubscription(null);
        console.error(error);
        toast.error("Failed to get current push subscription", {
          description: error.message,
        });
      });
    } else {
      setSubscription(null);
    }
  }, [supported]);
  const registration = useLookupPushRegistration({
    subscription,
    friendAccessToken,
  });
  const [subscribe, { subscribing, subscribeError }] = useWebPushSubscribe({
    friendAccessToken,
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
