# typed: true
# frozen_string_literal: true

class FriendActivityCouponSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :activity_coupon

  # == Attributes ==

  identifier
  attributes :id, :expires_at, :activity_id
end
