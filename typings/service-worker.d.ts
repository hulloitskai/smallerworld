interface ExtendableEvent {
  waitUntil(promise: Promise): void;
}

interface PushSubscriptionChangeEvent extends ExtendableEvent {
  readonly newSubscription: PushSubscription | null;
  readonly oldSubscription: PushSubscription | null;
}
