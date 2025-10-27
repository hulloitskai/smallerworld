# typed: true
# frozen_string_literal: true

class UserFriendPostSerializer < UserPublicPostSerializer
  # == Configuration
  object_as :post

  # == Type
  attribute :user_post_type, type: '"friend"' do
    "friend"
  end

  # == Attributes
  attributes replied: { type: :boolean },
             seen: { type: :boolean }
end
