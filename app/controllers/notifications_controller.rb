# typed: true
# frozen_string_literal: true

class NotificationsController < ApplicationController
  # == CSRF ==

  protect_from_forgery with: :null_session, only: %i[mark_delivered delivered]

  # == Actions ==

  # POST /notifications/mark_delivered?delivery_token=...
  def mark_delivered
    respond_to do |format|
      format.json do
        delivery_token = params.fetch(:delivery_token)
        if (notification = Notification.find_by_delivery_token(delivery_token))
          notification.mark_as_delivered!
        end
        render(json: {})
      end
    end
  end

  private

  # == Helpers ==

  sig { params(scope: Notification::PrivateRelation).returns(Notification) }
  def find_notification(scope: Notification.all)
    scope.find(params.fetch(:id))
  end
end
