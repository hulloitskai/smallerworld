# typed: true
# frozen_string_literal: true

class UserUniverseFriendPost < T::Struct
  extend T::Sig
  include UserUniversePost

  # == Properties ==

  const :post, Post
  const :associated_friend, Friend
  const :reply_to_number, String
  const :repliers, Integer
  const :replied, T::Boolean
  const :seen, T::Boolean

  # == Methods ==

  sig { override.returns(String) }
  def user_universe_post_type = "friend"
end
