# typed: true
# frozen_string_literal: true

class UserUniversePublicPostSerializer < ApplicationSerializer
  # == Attributes ==

  attributes user_universe_post_type: { type: '"public"' },
             seen: { type: :boolean }

  # == Associations ==

  flat_one :post, serializer: PostSerializer
  has_one :world, serializer: WorldProfileSerializer, nullable: true
end
