# typed: true
# frozen_string_literal: true

class PostNotificationPayloadSerializer < ApplicationSerializer
  # == Configuration
  object_as :payload, model: "PostNotificationPayload"

  # == Attributes
  attributes friend_access_token: { type: :string }
  attribute :user_handle, type: :string do
    payload.post.author!.handle
  end

  # == Associations
  has_one :post, serializer: NotificationPostSerializer
end
