# typed: true
# frozen_string_literal: true

class LocalUniverseFriendPost < T::Struct
  # == Properties
  const :post, Post
  delegate_missing_to :post

  const :associated_friend_access_token, String
  const :reply_to_number, String
  const :repliers, Integer
  const :replied, T::Boolean
  const :seen, T::Boolean
end
