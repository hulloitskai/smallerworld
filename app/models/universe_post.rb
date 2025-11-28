# typed: true
# frozen_string_literal: true

class UniversePost < T::Struct
  const :world, World
  const :post, T.any(Post, MaskedPost)
  const :repliers, Integer
  const :replied, T::Boolean
  const :seen, T::Boolean
  const :associated_friend, T.nilable(UniversePostAssociatedFriend)
end
