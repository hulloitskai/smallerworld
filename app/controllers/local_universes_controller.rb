# typed: true
# frozen_string_literal: true

class LocalUniversesController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world/universe
  def show
    render(inertia: "LocalUniversePage")
  end

  # GET /world/universe/worlds
  def worlds
    current_user = authenticate_user!
    associated_friends = current_user.associated_friends
    users = User
      .with_attached_page_icon
      .where(id: associated_friends.select(:user_id))
      .or(User.where(id: current_user.id))
      .left_outer_joins(:posts)
      .group("users.id")
      .select(
        "users.*",
        "MAX(posts.created_at) as last_post_created_at",
        "COUNT(posts.id) as post_count",
      )
      .order("last_post_created_at DESC NULLS LAST")
    friends_by_user_id = associated_friends.index_by(&:user_id)
    worlds = users.map do |user|
      friend = friends_by_user_id.fetch(user.id)
      LocalUniverseWorld.new(
        user:,
        post_count: user[:post_count],
        last_post_created_at: user[:last_post_created_at],
        associated_friend_access_token: friend.access_token,
      )
    end
    render(json: {
      worlds: LocalUniverseWorldSerializer.many(worlds),
    })
  end
end
