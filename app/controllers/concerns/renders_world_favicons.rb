# typed: true
# frozen_string_literal: true

module RendersWorldFavicons
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionController::Base }

  private

  # == Helpers ==

  sig do
    params(
      world: World,
      except_apple_touch_icon: T::Boolean,
    ).returns(T::Array[T::Hash[String,
                               String]])
  end
  def world_favicon_links(world, except_apple_touch_icon: false)
    icon_blob = world.icon_blob!
    favicon_variant =
      icon_blob.variant(resize_to_fill: [48, 48], format: "png")
    favicon_image_variant =
      icon_blob.variant(resize_to_fill: [96, 96], format: "png")
    apple_touch_icon_variant =
      icon_blob.variant(resize_to_fill: [180, 180], format: "png")
    icons = [
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
    ]
    unless except_apple_touch_icon
      icons << {
        "head-key" => "apple-touch-icon",
        "rel" => "apple-touch-icon",
        "href" => rails_representation_path(apple_touch_icon_variant),
      }
    end
    icons
  end
end
