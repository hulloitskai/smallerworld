# typed: true
# frozen_string_literal: true

class PostAlertNotificationPayloadSerializer < ApplicationSerializer
  # == Configuration
  object_as :payload, model: "PostAlertNotificationPayload"

  # == Attributes
  attributes friend_access_token: { type: :string, nullable: false }

  # == Associations
  has_one :post, serializer: PostNotificationPayloadPostSerializer
end
