# typed: true
# frozen_string_literal: true

class PostNotificationPayloadSerializer < ApplicationSerializer
  # == Configuration
  object_as :payload, model: "PostNotificationPayload"

  # == Associations
  has_one :post, serializer: PostNotificationPayloadPostSerializer
  has_one :author, serializer: PostNotificationPayloadAuthorSerializer do
    payload.post.author!
  end
end
