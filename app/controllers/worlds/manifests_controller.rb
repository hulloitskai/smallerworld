# typed: true
# frozen_string_literal: true

module Worlds
  class ManifestsController < ApplicationController
    include RendersManifestIcons

    # == Filters ==

    before_action :authenticate_friend!

    # == Actions ==

    # GET /worlds/:world_id/manifest.webmanifest?friend_token=...&icon_type=(generic|user) # rubocop:disable Layout/LineLength
    def show
      current_friend = authenticate_friend!
      world = find_world!(scope: World.with_owner.with_attached_icon)
      icons = if params[:icon_type] == "generic"
        application_manifest_icons
      else
        world_manifest_icons(world)
      end
      owner = world.owner!
      render(
        json: {
          id: world_path(
            world,
            friend_token: current_friend.access_token,
            trailing_slash: false,
          ),
          name: world.name,
          short_name: owner.name,
          description: "life updates, personal invitations, poems, and more!",
          icons:,
          display: "standalone",
          start_url: world_path(
            world,
            friend_token: current_friend.access_token,
          ),
          scope: world_path(world)
        },
      )
    end
  end
end
