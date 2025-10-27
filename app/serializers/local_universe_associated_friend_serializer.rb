# typed: true
# frozen_string_literal: true

class LocalUniverseAssociatedFriendSerializer < ApplicationSerializer
  # == Configurationj
  object_as :friend

  # == Attributes
  identifier
  attributes :access_token
end
