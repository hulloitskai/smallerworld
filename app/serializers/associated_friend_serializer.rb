# typed: true
# frozen_string_literal: true

class AssociatedFriendSerializer < ApplicationSerializer
  # == Configuration
  object_as :friend

  # == Attributes
  identifier
  attributes :access_token
end
