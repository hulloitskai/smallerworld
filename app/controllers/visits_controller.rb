# typed: true
# frozen_string_literal: true

class VisitsController < ApplicationController
  # == Filters
  before_action :require_authentication!

  # == Actions
  # POST /visits
  def track
    visit_params = params.expect(visit: %i[time_zone_name clear_notifications])
    if (friend = current_friend)
      friend.update!(notifications_last_cleared_at: Time.current)
    elsif (user = current_user)
      user_params = visit_params.slice(:time_zone_name)
      user.update!(notifications_last_cleared_at: Time.current, **user_params)
    end
    render(json: {})
  end
end
