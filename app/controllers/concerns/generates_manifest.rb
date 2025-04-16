# typed: true
# frozen_string_literal: true

module GeneratesManifest
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionController::Base }

  # == Constants
  GENERIC_MANIFEST_ICON_PREFIX = "web-app-manifest"

  private

  # == Helpers
  sig { params(user: User).returns(T::Array[T.untyped]) }
  def user_manifest_icons(user)
    icon_blob = user.page_icon_blob!
    width, height = image_blob_dimensions(icon_blob)
    smallest_dimension = [width, height].min
    if smallest_dimension >= 192
      [192, 512].filter_map do |size|
        next if size > smallest_dimension

        icon_variant = icon_blob.variant(
          resize_to_fill: [size, size],
          format: "png",
        )
        type = Mime::Type.lookup_by_extension(icon_variant.variation.format)
        {
          src: rails_representation_path(icon_variant),
          sizes: "#{size}x#{size}",
          type: type.to_s,
          purpose: "any",
        }
      end
    else
      icon_variant = icon_blob.variant(
        resize_to_fill: [192, 192],
        format: "png",
      )
      type = Mime::Type.lookup_by_extension(icon_variant.variation.format)
      [
        {
          src: rails_representation_path(icon_variant),
          sizes: "192x192",
          type: type.to_s,
          purpose: "any",
        },
      ]
    end
  end

  sig { returns(T::Array[T.untyped]) }
  def generic_manifest_icons
    [192, 512].map do |size|
      {
        src: "/#{GENERIC_MANIFEST_ICON_PREFIX}-#{size}x#{size}.png",
        sizes: "#{size}x#{size}",
        type: "image/png",
        purpose: "any",
      }
    end
  end

  sig { params(blob: ActiveStorage::Blob).returns([Integer, Integer]) }
  def image_blob_dimensions(blob)
    blob.analyze unless blob.analyzed?
    blob.metadata.fetch_values("width", "height")
  end
end
