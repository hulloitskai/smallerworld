# typed: true
# frozen_string_literal: true

class SuggestedFriend < T::Struct
  # == Properties
  const :user, User
  delegate_missing_to :user
end
