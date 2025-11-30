# typed: true
# frozen_string_literal: true

class SpacePost < T::Struct
  const :post, T.any(Post, MaskedPost)
  delegate :author, to: :post
  delegate :name, :world, to: :author, prefix: true

  const :repliers, Integer
  const :replied, T::Boolean
  const :seen, T::Boolean
  const :reply_to_number, T.nilable(String)
end
