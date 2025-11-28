# typed: true
# frozen_string_literal: true

class UniversePostSerializer < ApplicationSerializer
  # == Attributes ==

  attributes repliers: { type: :number },
             replied: { type: :boolean },
             seen: { type: :boolean }

  # == Associations ==

  flat_one :post, serializer: PostSerializer
  has_one :world, serializer: WorldProfileSerializer
  has_one :associated_friend, serializer: UniversePostAssociatedFriendSerializer
end
