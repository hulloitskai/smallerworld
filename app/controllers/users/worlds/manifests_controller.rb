# typed: true
# frozen_string_literal: true

module Users::Worlds
  class ManifestsController < ApplicationController
    include RendersManifestIcons

    # == Actions ==

    # GET /world/manifest.webmanifest
    def show
      world = current_world!(scope: World.with_attached_icon)
      render(
        json: {
          id: user_world_path(trailing_slash: false),
          name: "smaller world",
          short_name: "smaller world",
          description: "a smaller world for you and your friends :)",
          icons: world_manifest_icons(world),
          display: "standalone",
          start_url: user_world_path,
          scope: user_world_path,
        },
      )
    end
  end
end
