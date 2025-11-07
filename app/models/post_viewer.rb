# typed: true
# frozen_string_literal: true

class PostViewer < T::Struct
  # == Properties
  const :friend, Friend
  const :last_viewed_at, Time
end
