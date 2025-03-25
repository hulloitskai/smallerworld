# typed: true
# frozen_string_literal: true

class FriendInfoSerializer < ApplicationSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  identifier
  attributes :emoji
end
