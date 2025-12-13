# typed: true
# frozen_string_literal: true

class WellKnownController < ApplicationController
  def apple_app_site_association
    send_file(
      Rails.root.join("config/apple-app-site-association.json"),
      type: "application/json",
      disposition: "inline",
    )
  end
end
