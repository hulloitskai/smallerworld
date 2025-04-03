# typed: true
# frozen_string_literal: true

class VisitsController < ApplicationController
  # == Filters
  before_action :require_authentication!

  # == Actions
  # POST /visits
  def track
    visit_params = params.expect(visit: %i[time_zone_name clear_notifications])
    clear_notifications = visit_params.delete(:clear_notifications).truthy?
    if (friend = current_friend)
      friend.notifications_last_cleared_at = Time.current if clear_notifications
      friend.save!
    elsif (user = current_user)
      user.attributes = visit_params.slice(:time_zone_name)
      user.notifications_last_cleared_at = Time.current if clear_notifications
      user.save!
    end
    render(json: {})
  end
end
