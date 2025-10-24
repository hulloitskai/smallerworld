declare global {
  interface Window {
    resetWebPush: () => Promise<void>;
    sendTestNotification: () => Promise<void>;
  }
}

export const setupDevtools = (): void => {
  window.resetWebPush = (): Promise<void> =>
    navigator.serviceWorker.ready
      .then(({ pushManager }) => pushManager.getSubscription())
      .then(async subscription => {
        if (subscription) {
          const unsubscribed = await subscription.unsubscribe();
          if (unsubscribed) {
            console.info("Successfully reset push subscription");
          } else {
            console.error("Failed to reset push subscription");
          }
        } else {
          console.info("No active push subscription");
        }
      });

  window.sendTestNotification = (): Promise<void> => {
    const currentUrl = hrefToUrl(location.href);
    const friendToken = currentUrl.searchParams.get("friend_token");
    return navigator.serviceWorker.ready.then(async ({ pushManager }) => {
      const subscription = await pushManager.getSubscription();
      if (!subscription) {
        throw new Error("No active push subscription");
      }
      return fetchRoute(routes.pushSubscriptions.test, {
        descriptor: "send test notification",
        params: {
          query: {
            ...(friendToken && {
              friend_token: friendToken,
            }),
          },
        },
        data: {
          push_subscription: pick(subscription, "endpoint"),
        },
      });
    });
  };
};
