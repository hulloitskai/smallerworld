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
    associated_friends = current_user
      .associated_friends
      .where.not(user_id: current_user.id)
    users = User
      .with_attached_page_icon
      .where(id: associated_friends.select(:user_id))
      .or(User.where(id: current_user.id))
      .left_outer_joins(:posts)
      .group("users.id")
      .select(
        "users.*",
        "MAX(posts.created_at) as last_post_created_at",
      )
      .order("last_post_created_at DESC NULLS LAST")
    friends_by_user_id = associated_friends.index_by(&:user_id)
    uncleared_notification_counts_by_friend_id = Notification
      .where(recipient: associated_friends)
      .joins("INNER JOIN friends ON friends.id = notifications.recipient_id")
      .where("friends.notifications_last_cleared_at IS NULL OR notifications.created_at > friends.notifications_last_cleared_at") # rubocop:disable Layout/LineLength
      .group("notifications.recipient_id")
      .count
    worlds = users.map do |user|
      friend = friends_by_user_id[user.id]
      uncleared_notification_count = if friend
        uncleared_notification_counts_by_friend_id[friend.id] || 0
      else
        0
      end
      LocalUniverseWorld.new(
        user:,
        uncleared_notification_count:,
        last_post_created_at: user[:last_post_created_at],
        associated_friend_access_token: friend&.access_token,
      )
    end
    render(json: {
      worlds: LocalUniverseWorldSerializer.many(worlds),
    })
  end
end
