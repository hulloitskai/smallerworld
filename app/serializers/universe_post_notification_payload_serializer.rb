# typed: true
# frozen_string_literal: true

class UniversePostNotificationPayloadSerializer < ApplicationSerializer
  # == Configuration
  object_as :payload, model: "UniversePostNotificationPayload"

  # == Associations
  has_one :post, serializer: NotificationPostSerializer
end
