# typed: true
# frozen_string_literal: true

class WorldsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world
  def show
    current_user = authenticate_user!
    page_icon_blob = current_user.page_icon_blob!
    favicon_variant =
      page_icon_blob.variant(resize_to_fill: [48, 48], format: "png")
    favicon_image_variant =
      page_icon_blob.variant(resize_to_fill: [96, 96], format: "png")
    apple_touch_icon_variant =
      page_icon_blob.variant(resize_to_fill: [180, 180], format: "png")
    render(inertia: "WorldPage", props: {
      "faviconSrc" => rails_representation_path(favicon_variant),
      "faviconImageSrc" => rails_representation_path(favicon_image_variant),
      "appleTouchIconSrc" =>
        rails_representation_path(apple_touch_icon_variant),
    })
  end
end
