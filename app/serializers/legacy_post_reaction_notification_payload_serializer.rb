# typed: true
# frozen_string_literal: true

class LegacyPostReactionNotificationPayloadSerializer < ApplicationSerializer
  # == Configuration
  object_as :payload, model: "PostReactionNotificationPayload"

  # == Associations
  has_one :reaction,
          serializer: PostReactionNotificationPayloadReactionSerializer
end
