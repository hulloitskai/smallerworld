# typed: true
# frozen_string_literal: true

class LegacyPostReactionNotificationPayloadReactionSerializer < ApplicationSerializer # rubocop:disable Layout/LineLength
  # == Configuration
  object_as :post_reaction

  # == Attributes
  identifier
  attributes :emoji

  # == Associations
  has_one :post, serializer: LegacyNotificationPostSerializer
  has_one :friend, serializer: LegacyNotificationFriendSerializer
end
