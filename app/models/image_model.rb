# typed: true
# frozen_string_literal: true

class ImageModel < ActiveStorage::Blob
  extend T::Sig

  # == Constants
  MAX_SIZE = 2400
  SIZES = [320, 720, 1400, MAX_SIZE]

  # == Methods
  sig { returns(String) }
  def src
    variant = self.variant(resize_to_limit: [MAX_SIZE, MAX_SIZE])
    representation_path(variant)
  end

  sig { returns(T.nilable(String)) }
  def srcset
    return if content_type&.start_with?("image/gif")

    sources = SIZES.map do |size|
      variant = self.variant(resize_to_limit: [size, size])
      "#{representation_path(variant)} #{size}w"
    end
    sources.join(", ")
  end

  sig { returns(T.nilable({ width: Integer, height: Integer })) }
  def dimensions
    analyze unless analyzed?
    width, height = metadata.values_at("width", "height")
    if width.present? && height.present?
      { width:, height: }
    end
  end

  private

  # == Helpers
  sig { params(representation: T.untyped).returns(String) }
  def representation_path(representation)
    Rails.application.routes
      .url_helpers
      .rails_representation_path(representation)
  end
end
