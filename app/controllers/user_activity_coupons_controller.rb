# typed: true
# frozen_string_literal: true

class UserActivityCouponsController < ApplicationController
  # == Filters
  before_action :authenticate_friend!

  # == Actions
  # GET /users/:user_id/activity_coupons?friend_token=...
  def index
    user = load_user
    coupons = authorized_scope(user.activity_coupons).active
    render(json: {
      "activityCoupons" => ActivityCouponSerializer.many(coupons),
    })
  end

  private

  # == Helpers
  sig { params(scope: User::PrivateRelation).returns(User) }
  def load_user(scope: User.all)
    scope.find(params.fetch(:user_id))
  end
end
