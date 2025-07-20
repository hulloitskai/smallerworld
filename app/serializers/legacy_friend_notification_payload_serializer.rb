# typed: true
# frozen_string_literal: true

class LegacyFriendNotificationPayloadSerializer < ApplicationSerializer
  # == Configuration
  object_as :payload, model: "FriendNotificationPayload"

  # == Associations
  has_one :friend, serializer: FriendSerializer
end
