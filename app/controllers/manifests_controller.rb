# typed: true
# frozen_string_literal: true

class ManifestsController < ApplicationController
  include GeneratesManifest

  # == Filters ==

  before_action :authenticate_user!

  # == Actions ==

  # GET /manifest.webmanifest
  def show
    respond_to do |format|
      format.webmanifest do
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
          icons: brand_manifest_icons,
          display: "standalone",
          start_url: start_path,
          scope:,
        })
      end
    end
  end
end
