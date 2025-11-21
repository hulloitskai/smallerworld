# typed: true
# frozen_string_literal: true

class UserUniverseFriendPostSerializer < ApplicationSerializer
  # == Attributes ==

  attributes user_universe_post_type: { type: '"friend"' },
             reply_to_number: { type: :string },
             repliers: { type: :number },
             replied: { type: :boolean },
             seen: { type: :boolean }

  # == Associations ==

  flat_one :post, serializer: PostSerializer
  has_one :world, serializer: WorldProfileSerializer, nullable: true
  has_one :associated_friend, serializer: AssociatedFriendSerializer
end
