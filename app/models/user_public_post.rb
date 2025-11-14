# typed: true
# frozen_string_literal: true

class UserPublicPost < T::Struct
  # == Properties ==

  const :post, T.any(Post, MaskedPost)
  delegate_missing_to :post

  const :repliers, Integer
end
