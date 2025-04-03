# typed: true
# frozen_string_literal: true

class NotificationsController < ApplicationController
  # == CSRF
  protect_from_forgery with: :null_session, only: :delivered

  # == Filters
  before_action :require_authentication!, only: :cleared

  # == Actions
  # POST /notifications/:id/delivered
  def delivered
    notification = find_notification
    if (token = delivery_token)
      raise "Bad delivery token" unless notification.delivery_token == token
    else
      authenticate_user!
      authorize!(notification, to: :manage?)
    end
    notification.mark_as_delivered!
    render(json: {})
  end

  # # POST /notifications/cleared
  # def cleared
  #   subject = require_authentication!
  #   subject.update!(notifications_last_cleared_at: Time.current)
  #   render(json: {})
  # end

  private

  # == Helpers
  sig { returns(Notification) }
  def find_notification
    Notification.find(params.fetch(:id))
  end

  sig { returns(T.nilable(String)) }
  def delivery_token
    params.dig(:notification, :delivery_token)
  end
end
