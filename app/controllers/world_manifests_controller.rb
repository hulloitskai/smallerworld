# typed: true
# frozen_string_literal: true

class WorldManifestsController < ApplicationController
  include GeneratesManifest

  # == Filters ==

  before_action :authenticate_user!

  # == Actions ==

  # GET /world/manifest.webmanifest
  def show
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
end
