# typed: true
# frozen_string_literal: true

class WorldPostSerializer < PostSerializer
  # == Configuration
  object_as :post

  # == Attributes
  attribute :hidden_from_count, type: :number do
    post.hidden_from.size
  end
end
