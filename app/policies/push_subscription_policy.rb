# typed: true
# frozen_string_literal: true

class PushSubscriptionPolicy < ApplicationPolicy
  # == Rules
  def create?
    (user || friend).present?
  end

  def test?
    subscription = T.cast(record, PushSubscription)
    subscription.owner == (user || friend)
  end
end
