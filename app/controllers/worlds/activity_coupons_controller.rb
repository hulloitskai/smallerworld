# typed: true
# frozen_string_literal: true

module Worlds
  class ActivityCouponsController < ApplicationController
    # == Filters ==

    before_action :authenticate_friend!

    # == Actions ==

    # GET /worlds/:world_id/activity_coupons?friend_token=...
    def index
      respond_to do |format|
        format.json do
          world = find_world!
          coupons = authorized_scope(world.activity_coupons).active
          render(json: {
            "activityCoupons" => ActivityCouponSerializer.many(coupons),
          })
        end
      end
    end
  end
end
