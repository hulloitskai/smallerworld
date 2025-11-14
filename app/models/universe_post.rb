# typed: true
# frozen_string_literal: true

class UniversePost < T::Struct
  # == Properties ==

  const :post, Post
  const :associated_friend_access_token, T.nilable(String)
end
