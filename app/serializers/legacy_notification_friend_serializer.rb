# typed: true
# frozen_string_literal: true

class LegacyNotificationFriendSerializer < ApplicationSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  attributes :name, :emoji
end
