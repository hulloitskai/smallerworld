# typed: true
# frozen_string_literal: true

module Users
  class ManifestsController < ApplicationController
    include RendersManifestIcons

    # == Actions ==

    # GET /manifest.webmanifest
    def show
      scope = root_path
      name = "smaller world"
      unless Rails.env.production?
        env_name = Rails.env.development? ? "dev" : Rails.env.to_s
        name = "(#{env_name}) #{name}"
      end
      render(json: {
        id: scope,
        name:,
        short_name: "smaller world",
        description: "a smaller world for you and your friends :)",
        icons: application_manifest_icons,
        display: "standalone",
        start_url: start_pwa_path,
        scope:,
      })
    end
  end
end
