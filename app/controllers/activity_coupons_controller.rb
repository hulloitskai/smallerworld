# typed: true
# frozen_string_literal: true

class ActivityCouponsController < ApplicationController
  # == Filters ==

  before_action :authenticate_friend!, only: :mark_as_redeemed
  before_action :authenticate_user!, only: :create

  # == Actions ==

  # GET /activity_coupons?friend_token=...
  def index
    respond_to do |format|
      format.json do
        current_friend = authenticate_friend!
        activity_coupons = current_friend.activity_coupons.active
        render(json: {
          "activityCoupons" => ActivityCouponSerializer.many(activity_coupons),
        })
      end
    end
  end

  # POST /activity_coupons
  def create
    respond_to do |format|
      format.json do
        activity_id, friend_id = params
          .require(:activity_coupon)
          .fetch_values(:activity_id, :friend_id)
        activity = Activity.find(activity_id)
        authorize!(activity, to: :manage?)
        friend = Friend.find(friend_id)
        authorize!(friend, to: :manage?)
        activity_coupon = friend.activity_coupons.create!(activity:)
        render(
          json: {
            "activityCoupon" => ActivityCouponSerializer.one(activity_coupon),
          },
          status: :created,
        )
      end
    end
  end

  # PATCH /activity_coupons/:id/mark_as_redeemed
  def mark_as_redeemed
    respond_to do |format|
      format.json do
        activity_coupon = find_activity_coupon
        authorize!(activity_coupon)
        activity_coupon.mark_as_redeemed!
        render(json: {})
      end
    end
  end

  private

  # == Helpers ==

  sig { returns(ActivityCoupon) }
  def find_activity_coupon
    ActivityCoupon.find(params.fetch(:id))
  end
end
