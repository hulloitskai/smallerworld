# typed: true
# frozen_string_literal: true

class LocalUniverseFriendPostSerializer < LocalUniversePublicPostSerializer
  # == Configuration ==

  object_as :post

  # == Type ==

  attribute :local_universe_post_type, type: '"friend"' do
    "friend"
  end

  attribute :user_post_type, type: '"friend"' do
    "friend"
  end

  # == Attributes ==

  attributes reply_to_number: { type: :string },
             replied: { type: :boolean },
             seen: { type: :boolean },
             repliers: { type: :number }

  # == Associations ==

  has_one :associated_friend, serializer: AssociatedFriendSerializer
end
