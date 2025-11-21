# typed: true
# frozen_string_literal: true

class WorldFriendPostSerializer < WorldPublicPostSerializer
  # == Configuration ==

  object_as :post

  # == Type ==

  attribute :world_post_type, type: '"friend"' do
    "friend"
  end

  # == Attributes ==

  attributes replied: { type: :boolean }
end
