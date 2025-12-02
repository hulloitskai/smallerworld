# typed: true
# frozen_string_literal: true

class UserPostViewer < T::Struct
  const :viewer, PostViewer
  const :last_viewed_at, Time
  const :reaction_emojis, T::Array[String]
end
