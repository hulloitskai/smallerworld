# typed: true
# frozen_string_literal: true

class ActivityCouponPolicy < ApplicationPolicy
  # == Rules
  def mark_as_redeemed?
    coupon = T.cast(record, ActivityCoupon)
    coupon.friend! == friend!
  end
end
