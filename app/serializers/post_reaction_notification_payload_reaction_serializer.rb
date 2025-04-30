# typed: true
# frozen_string_literal: true

class PostReactionNotificationPayloadReactionSerializer < ApplicationSerializer
  # == Configuration
  object_as :post_reaction

  # == Attributes
  identifier
  attributes :emoji

  # == Associations
  has_one :post, serializer: NotificationPostSerializer
  has_one :friend, serializer: NotificationFriendSerializer
end
