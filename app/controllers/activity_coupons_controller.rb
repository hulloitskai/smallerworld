# typed: true
# frozen_string_literal: true

class ActivityCouponsController < ApplicationController
  # == Filters
  before_action :authenticate_friend!, only: :mark_as_redeemed
  before_action :authenticate_user!, only: :create

  # == Actions
  # GET /activity_coupons?friend_token=...
  def index
    current_friend = authenticate_friend!
    coupons = current_friend.activity_coupons.active
    render(json: {
      "activityCoupons" => ActivityCouponSerializer.many(coupons),
    })
  end

  # POST /activity_coupons
  def create
    coupon_params = params.expect(activity_coupon: %i[activity_id friend_id])
    coupon_params.to_h => { activity_id:, friend_id: }
    activity = Activity.find(activity_id)
    authorize!(activity, to: :manage?)
    friend = Friend.find(friend_id)
    authorize!(friend, to: :manage?)
    coupon = friend.activity_coupons.create!(activity:)
    render(
      json: {
        "activityCoupon" => ActivityCouponSerializer.one(coupon),
      },
      status: :created,
    )
  end

  # PATCH /activity_coupons/:id/mark_as_redeemed
  def mark_as_redeemed
    coupon = load_coupon
    authorize!(coupon)
    coupon.mark_as_redeemed!
    render(json: {})
  end

  private

  # == Helpers
  sig { returns(ActivityCoupon) }
  def load_coupon
    ActivityCoupon.find(params.fetch(:id))
  end
end
