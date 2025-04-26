# typed: true
# frozen_string_literal: true

class WorldFriendSerializer < FriendSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  attributes notifiable: { type: :boolean }
end
