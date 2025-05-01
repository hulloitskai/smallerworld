# typed: true
# frozen_string_literal: true

class NotifiableFriend < T::Struct
  # == Properties
  const :friend, Friend
  delegate_missing_to :friend

  const :notifiable, T::Boolean
end
