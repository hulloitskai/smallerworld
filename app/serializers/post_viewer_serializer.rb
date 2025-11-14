# typed: strict
# frozen_string_literal: true

class PostViewerSerializer < ApplicationSerializer
  # == Attributes ==

  attributes last_viewed_at: { type: :string },
             reaction_emojis: { type: "string[]" }

  # == Associations ==

  flat_one :friend, serializer: FriendProfileSerializer
end
