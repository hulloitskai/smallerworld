# typed: true
# frozen_string_literal: true

class WorldFriendSerializer < ApplicationSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  identifier
  attributes :emoji
end
