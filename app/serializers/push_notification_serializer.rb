# typed: true
# frozen_string_literal: true

class PushNotificationSerializer < NotificationSerializer
  # == Configuration
  object_as :notification

  # == Attributes
  attribute :delivery_token, type: :string, nullable: true do
    notification.delivery_token || notification.generate_delivery_token
  end
end
