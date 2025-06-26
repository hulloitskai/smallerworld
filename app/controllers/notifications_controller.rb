# typed: true
# frozen_string_literal: true

class NotificationsController < ApplicationController
  # == CSRF
  protect_from_forgery with: :null_session, only: %i[mark_delivered delivered]

  # == Actions
  # POST /notifications/mark_delivered?delivery_token=...
  def mark_delivered
    delivery_token = params.fetch(:delivery_token)
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
      raise ActionController::ParameterMissing, "notification.delivery_token"
    notification = if delivery_token.length == ActiveRecord::SecureToken::MINIMUM_TOKEN_LENGTH # rubocop:disable Layout/LineLength
      notification = load_notification
      notification if notification.delivery_token == delivery_token
    elsif (notification = Notification.find_by_delivery_token(delivery_token)) && notification.id == params[:id] # rubocop:disable Layout/LineLength
      notification
    end
    if notification && !notification.delivered?
      notification.mark_as_delivered!
    end
    render(json: {})
  end

  private

  # == Helpers
  sig { params(scope: Notification::PrivateRelation).returns(Notification) }
  def load_notification(scope: Notification.all)
    scope.find(params.fetch(:id))
  end
end
