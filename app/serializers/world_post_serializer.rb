# typed: true
# frozen_string_literal: true

class WorldPostSerializer < PostSerializer
  # == Configuration
  object_as :post

  # == Attributes
  attributes :updated_at, hidden_from_ids: { type: "string[]" }

  has_one :encouragement, serializer: EncouragementSerializer, nullable: true
end
