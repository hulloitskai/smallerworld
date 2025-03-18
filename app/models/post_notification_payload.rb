# typed: true
# frozen_string_literal: true

class PostNotificationPayload < T::Struct
  # == Properties
  const :post, Post
  const :friend_access_token, String
end
