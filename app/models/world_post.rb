# typed: true
# frozen_string_literal: true

class WorldPost < T::Struct
  const :post, T.any(Post, MaskedPost)
  const :repliers, Integer
  const :replied, T::Boolean
  const :seen, T::Boolean
end
