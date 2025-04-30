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
      .first(3)
    if latest_friends.size < 3
      latest_friends += current_user.friends
        .reverse_chronological
        .where.missing(:push_registrations)
        .distinct
        .first(3 - latest_friends.size)
    end
    pending_join_requests = current_user.join_requests.pending.count
    paused_friends = current_user.friends.paused.count
    render(inertia: "WorldPage", props: {
      "faviconLinks" => user_favicon_links(current_user),
      "latestFriends" => WorldFriendSerializer.many(latest_friends),
      "pendingJoinRequests" => pending_join_requests,
      "pausedFriends" => paused_friends,
      "hideStats" => current_user.hide_stats,
    })
  end

  # GET /world/edit
  def edit
    current_user = authenticate_user!
    render(inertia: "EditWorldPage", props: {
      "hideStats" => current_user.hide_stats,
    })
  end

  # PUT /world
  def update
    current_user = authenticate_user!
    user_params = T.let(
      params.expect(user: %i[name page_icon theme hide_stats]),
      ActionController::Parameters,
    )
    if current_user.update(user_params)
      render(json: { user: UserSerializer.one(current_user) })
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
        name: "smaller world",
        short_name: "smaller world",
        description: "a smaller world for you and your friends :)",
        icons: user_manifest_icons(current_user),
        display: "standalone",
        start_url: world_path,
        scope: world_path,
      },
      content_type: "application/manifest+json",
    )
  end
end
