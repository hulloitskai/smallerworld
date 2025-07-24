declare global {
  interface Window {
    resetWebPush: () => Promise<void>;
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
};
