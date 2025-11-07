# typed: true
# frozen_string_literal: true

class WorldsController < ApplicationController
  include GeneratesManifest
  include RendersUserFavicons
  include RendersTimeline

  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world?intent=(installation_instructions|install)
  def show
    current_user = authenticate_user!
    latest_friends = current_user.friends
      .reverse_chronological
      .where.associated(:push_registrations)
      .distinct
      .select(:id, :created_at, :emoji)
      .first(3)
    if latest_friends.size < 3
      latest_friends += current_user.friends
        .reverse_chronological
        .where.missing(:push_registrations)
        .distinct
        .select(:id, :created_at, :emoji)
        .first(3 - latest_friends.size)
    end
    pending_join_requests = current_user.join_requests.pending.count
    paused_friend_ids = current_user.friends.paused.pluck(:id)
    render(inertia: "WorldPage", user_theme: current_user.theme, props: {
      "faviconLinks" => user_favicon_links(current_user),
      "latestFriendEmojis" => latest_friends.map(&:emoji),
      "pendingJoinRequests" => pending_join_requests,
      "hideStats" => current_user.hide_stats,
      "hideNeko" => current_user.hide_neko,
      "pausedFriendIds" => paused_friend_ids,
    })
  end

  # GET /world/edit
  def edit
    current_user = authenticate_user!
    render(inertia: "EditWorldPage", user_theme: current_user.theme, props: {
      "hideStats" => current_user.hide_stats,
      "hideNeko" => current_user.hide_neko,
      "allowFriendSharing" => current_user.allow_friend_sharing,
    })
  end

  # PUT /world
  def update
    current_user = authenticate_user!
    user_params = params.expect(user: %i[
      name
      page_icon
      theme
      hide_stats
      hide_neko
      allow_friend_sharing
    ])
    if current_user.update(**user_params)
      render(json: {
        user: UserSerializer.one(current_user),
      })
    else
      render(
        json: { errors: current_user.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # GET /world/manifest.webmanifest
  def manifest
    current_user = authenticate_user!
    render(
      json: {
        id: world_path,
        name: "smaller world",
        short_name: "smaller world",
        description: "a smaller world for you and your friends :)",
        icons: user_manifest_icons(current_user),
        display: "standalone",
        start_url: world_path(trailing_slash: true),
        scope: world_path(trailing_slash: true),
      },
      content_type: "application/manifest+json",
    )
  end

  # GET /world/timeline?start_date=...&time_zone=...
  def timeline
    current_user = authenticate_user!
    time_zone = find_timeline_time_zone!
    start_date = find_timeline_start_date!(time_zone:)
    timeline_posts = scoped do
      select_sql = Post.sanitize_sql_array([
        "DISTINCT ON (DATE(created_at AT TIME ZONE :tz)) " \
          "DATE(created_at AT TIME ZONE :tz) AS date, emoji",
        tz: time_zone.name,
      ])
      order_sql = Post.sanitize_sql_array([
        "DATE(created_at AT TIME ZONE :tz), created_at DESC",
        tz: time_zone.name,
      ])
      current_user.posts
        .where(created_at: start_date.in_time_zone(time_zone)..)
        .select(select_sql)
        .order(Arel.sql(order_sql))
        .to_a
    end
    timeline = build_timeline(timeline_posts, time_zone:)
    post_streak = current_user.post_streak(time_zone:)
    render(json: {
      timeline:,
      "postStreak" => PostStreakSerializer.one_if(post_streak),
    })
  end
end
