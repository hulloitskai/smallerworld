# typed: true
# frozen_string_literal: true

class NotificationsController < ApplicationController
  # == CSRF
  protect_from_forgery with: :null_session, only: %i[mark_delivered delivered]

  # == Actions
  # POST /notifications/mark_delivered?delivery_token=...
  def mark_delivered
    delivery_token = params[:delivery_token] or
      raise ActionController::ParameterMissing, "Missing delivery token"
    if (notification = Notification.find_by_delivery_token(delivery_token))
      notification.mark_as_delivered!
    end
    render(json: {})
  end

  # TODO: Deprecated, remove after May 24, 2025
  #
  # POST /notifications/:id/delivered
  def delivered
    delivery_token = params.dig(:notification, :delivery_token) or
      raise ActionController::ParameterMissing, "Missing delivery token"
    notification = find_notification
    unless notification.delivery_token == delivery_token
      raise "Bad delivery token"
    end

    notification.mark_as_delivered! unless notification.delivered?
    render(json: {})
  end

  private

  # == Helpers
  sig { returns(Notification) }
  def find_notification
    Notification.find(params.fetch(:id))
  end
end
