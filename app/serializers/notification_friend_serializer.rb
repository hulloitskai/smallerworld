# typed: true
# frozen_string_literal: true

class NotificationFriendSerializer < ApplicationSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  attributes :name, :emoji
end
