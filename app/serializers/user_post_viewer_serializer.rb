# typed: strict
# frozen_string_literal: true

class UserPostViewerSerializer < ApplicationSerializer
  # == Attributes ==

  attributes last_viewed_at: { type: :string },
             reaction_emojis: { type: "string[]" }

  # == Associations ==
  flat_one :viewer, serializer: PostViewerSerializer
end
