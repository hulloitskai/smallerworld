# typed: true
# frozen_string_literal: true

class UniverseWorld < T::Struct
  extend T::Sig

  # == Properties
  const :user, User
  delegate :page_icon_image, to: :user
  delegate :id, :handle, :name, to: :user, prefix: true

  const :post_count, Integer
  const :last_post_created_at, T.nilable(Time)
  const :associated_friend_access_token, T.nilable(String)
end
