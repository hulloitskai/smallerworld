# typed: true
# frozen_string_literal: true

class FriendSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :created_at, :name, :emoji, :access_token
end
