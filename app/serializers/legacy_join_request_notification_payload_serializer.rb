# typed: true
# frozen_string_literal: true

class LegacyJoinRequestNotificationPayloadSerializer < ApplicationSerializer
  # == Configuration
  object_as :payload, model: "JoinRequestNotificationPayload"

  # == Associations
  has_one :join_request, serializer: JoinRequestSerializer
end
