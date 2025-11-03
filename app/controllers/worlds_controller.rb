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

  # GET /world/timeline
  def timeline
    current_user = authenticate_user!
    time_zone_name = params.fetch(:time_zone)
    time_zone = ActiveSupport::TimeZone.new(time_zone_name)
    today = time_zone.today
    start_time = (today - 13.days).beginning_of_day
    posts = current_user.posts
      .where(created_at: start_time..)
      .select(Arel.sql(
        "DISTINCT ON (DATE(created_at AT TIME ZONE :tz)) DATE(created_at AT TIME ZONE :tz) AS date, emoji", # rubocop:disable Layout/LineLength
        tz: time_zone.tzinfo.name,
      ))
      .order(Arel.sql(
        "DATE(created_at AT TIME ZONE :tz), created_at DESC",
        tz: time_zone.tzinfo.name,
      ))
    timeline = {}
    posts.each do |post|
      timeline[post["date"]] = { emoji: post.emoji }
    end
    render(json: { timeline: })
  end
end
