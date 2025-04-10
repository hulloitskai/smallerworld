# typed: true
# frozen_string_literal: true

class EncouragementSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :emoji, :message

  # == Associations
  has_one :friend, serializer: EncouragementFriendSerializer
end
