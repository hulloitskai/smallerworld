# typed: true
# frozen_string_literal: true

class ActivityCouponsController < ApplicationController
  # == Filters
  before_action :authenticate_friend!, only: :index

  # == Actions
  # GET /activity_coupons?friend_token=...
  def index
    current_friend = authenticate_friend!
    activity_coupons = current_friend.activity_coupons.active
    render(json: {
      "activityCoupons" => ActivityCouponSerializer.many(activity_coupons),
    })
  end
end
