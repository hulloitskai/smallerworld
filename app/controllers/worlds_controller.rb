# typed: true
# frozen_string_literal: true

class WorldsController < ApplicationController
  include RendersUserFavicons
  include GeneratesManifest

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
    render(inertia: "WorldPage", props: {
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
    render(inertia: "EditWorldPage", props: {
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

  # GET /world/timeline?start_date=...
  def timeline
    current_user = authenticate_user!
    start_date = scoped do
      value = params[:start_date] or raise "Missing start date"
      raise "Invalid start date: #{value}" unless value.is_a?(String)

      value.to_time or raise "Invalid start date: #{value}"
    end
    if start_date < 1.year.ago
      raise "Start date must be within the last year"
    end

    timeline_posts = scoped do
      offset = start_date.formatted_offset
      select_sql = Post.sanitize_sql_array([
        "DISTINCT ON (DATE(created_at AT TIME ZONE INTERVAL :offset)) " \
          "DATE(created_at AT TIME ZONE INTERVAL :offset) AS date, emoji",
        offset:,
      ])
      order_sql = Post.sanitize_sql_array([
        "DATE(created_at AT TIME ZONE INTERVAL :offset), created_at DESC",
        offset:,
      ])
      current_user.posts
        .where(created_at: start_date..)
        .select(select_sql)
        .order(Arel.sql(order_sql))
    end

    timeline = timeline_posts
      .map do |post|
        date = T.cast(post["date"], Date)
        [date.to_s, { emoji: post.emoji }]
      end
      .to_h
    render(json: { timeline: })
  end
end
