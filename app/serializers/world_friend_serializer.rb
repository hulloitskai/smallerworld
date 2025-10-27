# typed: true
# frozen_string_literal: true

class WorldFriendSerializer < FriendProfileSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  attributes paused?: { as: :paused, type: :boolean }
  attribute :notifiable, type: '"sms" | "push" | false' do
    if friend.push_registrations.any?
      "push"
    elsif friend.phone_number?
      "sms"
    else
      false
    end
  end

  # == Associations
  has_many :active_activity_coupons,
           serializer: FriendActivityCouponSerializer
end
