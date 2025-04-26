# typed: true
# frozen_string_literal: true

class UserPost < T::Struct
  # == Properties
  const :post, T.any(Post, MaskedPost)
  delegate_missing_to :post

  const :replied, T.nilable(T::Boolean)
  const :repliers, Integer
end
