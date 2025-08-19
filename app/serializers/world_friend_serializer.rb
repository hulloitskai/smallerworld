# typed: true
# frozen_string_literal: true

class WorldFriendSerializer < ApplicationSerializer
  # == Attributes
  attributes notifiable: { type: :boolean },
             paused?: { as: :paused, type: :boolean }

  # == Associations
  flat_one :friend, serializer: FriendProfileSerializer
  has_many :active_activity_coupons, serializer: FriendActivityCouponSerializer
end
