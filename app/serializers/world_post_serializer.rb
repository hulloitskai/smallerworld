# typed: true
# frozen_string_literal: true

class WorldPostSerializer < ApplicationSerializer
  # == Attributes ==

  attributes repliers: { type: :number },
             seen: { type: :boolean },
             replied: { type: :boolean }

  # == Associations ==
  flat_one :post, serializer: PostSerializer
end
