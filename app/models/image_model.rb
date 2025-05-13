# typed: true
# frozen_string_literal: true

class ImageModel < ActiveStorage::Blob
  extend T::Sig

  # == Constants
  SIZES = [320, 720, 1400]

  # == Methods
  sig { returns(String) }
  def src
    representation_path(self)
  end

  sig { returns(T.nilable(String)) }
  def srcset
    return if content_type&.start_with?("image/gif")

    sources = SIZES.map do |size|
      representation = representation(resize_to_limit: [size, size])
      "#{representation_path(representation)} #{size}w"
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
