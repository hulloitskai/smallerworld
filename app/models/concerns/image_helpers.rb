# typed: strict
# frozen_string_literal: true

require "vips"

module ImageHelpers
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActiveRecord::Base }

  private

  # == Helpers ==

  sig { params(blob: ActiveStorage::Blob).returns(T::Boolean) }
  def image_blob_is_opaque?(blob)
    blob.open do |file|
      image = Vips::Image.new_from_file(file.to_path)
      image_is_opaque?(image)
    end
  end

  sig { params(image: Vips::Image).returns(T::Boolean) }
  def image_is_opaque?(image)
    return true unless image.has_alpha?

    alpha = image[image.bands - 1]
    alpha.min == 255
  end
end
