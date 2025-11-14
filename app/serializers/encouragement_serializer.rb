# typed: true
# frozen_string_literal: true

class EncouragementSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes :created_at, :emoji, :message

  # == Associations ==

  has_one :friend, serializer: EncouragementFriendSerializer
end
