# typed: true
# frozen_string_literal: true

module RendersUserFavicons
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionController::Base }

  private

  # == Helpers ==

  sig { params(user: User).returns(T::Array[T::Hash[String, String]]) }
  def user_favicon_links(user)
    icon_blob = user.page_icon_blob!
    favicon_variant =
      icon_blob.variant(resize_to_fill: [48, 48], format: "png")
    favicon_image_variant =
      icon_blob.variant(resize_to_fill: [96, 96], format: "png")
    apple_touch_icon_variant =
      icon_blob.variant(resize_to_fill: [180, 180], format: "png")
    [
      {
        "head-key" => "favicon",
        "rel" => "shortcut icon",
        "href" => rails_representation_path(favicon_variant),
      },
      {
        "head-key" => "favicon-image",
        "rel" => "icon",
        "type" => "image/png",
        "href" => rails_representation_path(favicon_image_variant),
        "sizes" => "96x96",
      },
      {
        "head-key" => "apple-touch-icon",
        "rel" => "apple-touch-icon",
        "href" => rails_representation_path(apple_touch_icon_variant),
      },
    ]
  end
end
