# typed: true
# frozen_string_literal: true

class FriendProfileSerializer < ApplicationSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  identifier
  attributes :name, :emoji
end
