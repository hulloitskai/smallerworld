# typed: true
# frozen_string_literal: true

class UniversePost < T::Struct
  # == Properties
  const :post, T.any(Post, MaskedPost)
  delegate_missing_to :post
end
