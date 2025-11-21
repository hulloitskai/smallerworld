# typed: true
# frozen_string_literal: true

class UserUniverseAuthorPostSerializer < ApplicationSerializer
  # == Attributes ==

  attributes user_universe_post_type: { type: '"author"' },
             updated_at: { type: :string },
             hidden_from_ids: { type: "string[]" }

  # == Associations ==

  flat_one :post, serializer: PostWithoutEncouragementSerializer
  has_one :world, serializer: WorldProfileSerializer, nullable: true
  has_one :encouragement, serializer: EncouragementSerializer, nullable: true
end
