# typed: true
# frozen_string_literal: true

class JoinedUser < T::Struct
  # == Properties
  const :user, User
  delegate_missing_to :user

  const :friend_access_token, String
  const :friended, T::Boolean
end
