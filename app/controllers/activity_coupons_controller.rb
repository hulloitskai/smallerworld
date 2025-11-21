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
        coupons = current_friend.activity_coupons.active
        render(json: {
          coupons: ActivityCouponSerializer.many(coupons),
        })
      end
    end
  end

  # POST /activity_coupons
  def create
    respond_to do |format|
      format.json do
        activity_coupon_params = params
          .expect(coupon: %i[activity_id friend_id])
        activity = Activity.find(activity_coupon_params.fetch(:activity_id))
        authorize!(activity, to: :manage?)
        friend = Friend.find(activity_coupon_params.fetch(:friend_id))
        authorize!(friend, to: :manage?)
        coupon = friend.activity_coupons.create!(activity:)
        render(
          json: {
            coupon: ActivityCouponSerializer.one(coupon),
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
        coupon = find_coupon!
        authorize!(coupon)
        coupon.mark_as_redeemed!
        render(json: {})
      end
    end
  end

  private

  # == Helpers ==

  sig { returns(ActivityCoupon) }
  def find_coupon!
    ActivityCoupon.find(params.fetch(:id))
  end
end
