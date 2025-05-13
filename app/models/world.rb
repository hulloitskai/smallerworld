# typed: true
# frozen_string_literal: true

class World < T::Struct
  extend T::Sig

  # == Properties
  const :user, User
  delegate :page_icon_model, to: :user
  delegate :id, :handle, :name, to: :user, prefix: true

  const :post_count, Integer
  const :last_post_created_at, T.nilable(Time)

  const :associated_friend, T.nilable(Friend)
  delegate :access_token, to: :associated_friend, prefix: true, allow_nil: true
end
