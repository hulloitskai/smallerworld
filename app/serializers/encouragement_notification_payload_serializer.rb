# typed: true
# frozen_string_literal: true

class EncouragementNotificationPayloadSerializer < ApplicationSerializer
  # == Configuration
  object_as :payload, model: "EncouragementNotificationPayload"

  # == Associations
  has_one :encouragement, serializer: EncouragementSerializer
end
