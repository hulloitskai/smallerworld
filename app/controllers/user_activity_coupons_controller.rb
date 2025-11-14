# typed: true
# frozen_string_literal: true

class UserActivityCouponsController < ApplicationController
  # == Filters ==

  before_action :authenticate_friend!

  # == Actions ==

  # GET /users/:user_id/activity_coupons?friend_token=...
  def index
    respond_to do |format|
      format.json do
        user = find_user
        coupons = authorized_scope(user.activity_coupons).active
        render(json: {
          "activityCoupons" => ActivityCouponSerializer.many(coupons),
        })
      end
    end
  end

  private

  # == Helpers ==

  sig { params(scope: User::PrivateRelation).returns(User) }
  def find_user(scope: User.all)
    scope.find(params.fetch(:user_id))
  end
end
