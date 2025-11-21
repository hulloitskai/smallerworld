# typed: true
# frozen_string_literal: true

class WorldFriendPost < T::Struct
  # == Properties ==

  const :post, T.any(Post, MaskedPost)
  delegate_missing_to :post

  const :repliers, Integer
  const :replied, T::Boolean
  const :seen, T::Boolean
end
