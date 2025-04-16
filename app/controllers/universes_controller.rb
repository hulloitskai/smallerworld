# typed: true
# frozen_string_literal: true

class UniversesController < ApplicationController
  # == Actions
  # GET /universe
  def show
    render(inertia: "UniversePage")
  end

  # GET /universe/worlds
  def worlds
    users = User
      .left_outer_joins(:posts)
      .group("users.id")
      .select(
        "users.*",
        "MAX(posts.created_at) as last_post_created_at",
        "COUNT(posts.id) as post_count",
      )
      .order("last_post_created_at DESC NULLS LAST")
    joined_worlds, other_worlds = [], []
    users.each do |user|
      associated_friend = associated_friends_by_user_id[user.id]
      world = World.new(
        user:,
        post_count: user[:post_count],
        last_post_created_at: user[:last_post_created_at],
        associated_friend:,
      )
      if user == current_user || associated_friend
        joined_worlds << world
      else
        other_worlds << world
      end
    end
    render(json: {
      "joinedWorlds" => WorldSerializer.many(joined_worlds),
      "otherWorlds" => WorldSerializer.many(other_worlds),
    })
  end

  private

  # == Helpers
  sig { returns(T::Hash[String, Friend]) }
  def associated_friends_by_user_id
    @_associated_friends_by_user_id ||= scoped do
      if (user = current_user)
        associated_friend_ids = PushRegistration
          .where(owner_type: "Friend")
          .and(
            PushRegistration.where(
              device_id: user.push_registrations.select(:device_id),
            ).or(PushRegistration.where(
              device_fingerprint:
                user.push_registrations.select(:device_fingerprint),
            )),
          )
          .select(:owner_id)
        Friend
          .where(id: associated_friend_ids)
          .index_by(&:user_id)
      else
        {}
      end
    end
  end
end
