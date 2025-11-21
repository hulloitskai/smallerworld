# typed: true
# frozen_string_literal: true

class UniverseWorldProfile < T::Struct
  extend T::Sig

  # == Properties ==

  const :world, World
  const :uncleared_notification_count, Integer
  const :last_post_created_at, T.nilable(Time)
  const :associated_friend_access_token, T.nilable(String)
end
