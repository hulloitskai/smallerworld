# typed: true
# frozen_string_literal: true

class VisitsController < ApplicationController
  # == Filters
  before_action :require_authentication!

  # == Actions
  # POST /visits
  def track
    visit_params = params.expect(visit: :time_zone)
    if (friend = current_friend)
      friend.update!(notifications_last_cleared_at: Time.current)
    elsif (user = current_user)
      user.update!(
        notifications_last_cleared_at: Time.current,
        **visit_params,
      )
    end
    render(json: {})
  end
end
