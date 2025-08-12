# typed: true
# frozen_string_literal: true

class ActivityCouponPolicy < ApplicationPolicy
  # == Rules
  def mark_as_redeemed?
    coupon = T.cast(record, ActivityCoupon)
    coupon.friend! == friend!
  end

  # == Scopes
  relation_scope do |relation|
    relation = T.cast(relation, ActivityCoupon::PrivateRelation)
    if (friend = self.friend)
      relation.where(friend:)
    elsif (user = self.user)
      relation.joins(activity: :user).where(activity: { user: })
    else
      relation.none
    end
  end
end
