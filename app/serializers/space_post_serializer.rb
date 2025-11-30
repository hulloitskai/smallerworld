# typed: true
# frozen_string_literal: true

class SpacePostSerializer < ApplicationSerializer
  # == Attributes ==

  attributes repliers: { type: :number },
             seen: { type: :boolean },
             replied: { type: :boolean },
             author_name: { type: :string },
             reply_to_number: { type: :string, nullable: true }

  # == Associations ==
  has_one :author_world,
          serializer: AuthorWorldProfileSerializer,
          nullable: true
  flat_one :post, serializer: PostSerializer
end
