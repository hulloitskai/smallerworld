# typed: true
# frozen_string_literal: true

class PostStickerSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :friend_id,
             :emoji

  # == Associations
  has_one :relative_position, serializer: PositionSerializer
end
