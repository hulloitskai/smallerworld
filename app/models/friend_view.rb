# typed: true
# frozen_string_literal: true

class FriendView < T::Struct
  # == Properties
  const :friend, Friend
  delegate_missing_to :friend

  const :notifiable, T::Boolean
end
