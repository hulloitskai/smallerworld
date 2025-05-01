import { createContext, useCallback, useContext } from "react";

import { type PushRegistration } from "~/types";

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

export interface SendTestNotificationReturn {
  send: (subscription: PushSubscription) => Promise<void>;
  sent: boolean;
  sending: boolean;
}

export const useSendTestNotification = (): SendTestNotificationReturn => {
  const currentFriend = useCurrentFriend();
  const { trigger, mutating } = useRouteMutation(
    routes.pushSubscriptions.test,
    {
      descriptor: "send test notification",
      params: {
        query: {
          ...(currentFriend && {
            friend_token: currentFriend.access_token,
          }),
        },
      },
    },
  );
  const send = useCallback(
    async (subscription: PushSubscription) => {
      await trigger({
        subscription: {
          endpoint: subscription.endpoint,
        },
      });
    },
    [trigger],
  );
  return {
    send,
    sent: false,
    sending: mutating,
  };
};
