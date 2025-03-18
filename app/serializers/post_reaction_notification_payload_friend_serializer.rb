# typed: true
# frozen_string_literal: true

class PostReactionNotificationPayloadFriendSerializer < ApplicationSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  attributes :name, :emoji
end
