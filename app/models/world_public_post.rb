# typed: true
# frozen_string_literal: true

class WorldPublicPost < T::Struct
  # == Properties ==

  const :post, T.any(Post, MaskedPost)
  delegate_missing_to :post

  const :repliers, Integer
end
