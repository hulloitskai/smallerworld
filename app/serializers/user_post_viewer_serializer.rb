# typed: strict
# frozen_string_literal: true

class UserPostViewerSerializer < PostReactorSerializer
  # == Configuration ==

  object_as :post_viewer

  # == Attributes ==

  attributes last_viewed_at: { type: :string },
             reaction_emojis: { type: "string[]" }
end
