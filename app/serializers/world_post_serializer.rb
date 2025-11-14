# typed: true
# frozen_string_literal: true

class WorldPostSerializer < PostSerializer
  # == Configuration ==

  object_as :post

  # == Attributes ==

  attributes :updated_at

  # == Associations ==

  has_one :encouragement, serializer: EncouragementSerializer, nullable: true
end
