# typed: true
# frozen_string_literal: true

class WorldPostSerializer < PostSerializer
  # == Configuration
  object_as :post

  # == Attributes
  attributes :updated_at, hidden_from_ids: { type: "string[]" }
end
