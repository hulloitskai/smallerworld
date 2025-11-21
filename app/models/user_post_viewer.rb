# typed: true
# frozen_string_literal: true

class UserPostViewer < T::Struct
  extend T::Sig

  # == Properties ==

  const :viewer, PostViewer
  delegate_missing_to :viewer

  const :last_viewed_at, Time
  const :reaction_emojis, T::Array[String]
end
