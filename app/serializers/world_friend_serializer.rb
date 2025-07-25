# typed: true
# frozen_string_literal: true

class WorldFriendSerializer < FriendSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  attributes notifiable: { type: :boolean },
             paused?: { as: :paused, type: :boolean }

  # == Associations
  has_many(
    :active_activity_coupons,
    serializer: FriendActivityCouponSerializer,
  ) do
    friend.activity_coupons.active
  end
end
