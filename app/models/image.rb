# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: active_storage_blobs
#
#  id           :uuid             not null, primary key
#  byte_size    :bigint           not null
#  checksum     :string
#  content_type :string
#  filename     :string           not null
#  key          :string           not null
#  metadata     :text
#  service_name :string           not null
#  created_at   :datetime         not null
#
# Indexes
#
#  index_active_storage_blobs_on_key  (key) UNIQUE
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Image < ActiveStorage::Blob
  extend T::Sig

  # == Constants
  NOTIFICATION_SIZE = 720
  MAX_SIZE = 2400
  SIZES = [320, NOTIFICATION_SIZE, 1400, MAX_SIZE]
  VARIANT_PARAMS = {
    saver: {
      strip: true,
      quality: 75,
      lossless: false,
      alpha_q: 85,
      reduction_effort: 6,
      smart_subsample: true,
    },
    format: "webp",
  }

  # == Methods
  sig { returns(String) }
  def src
    if gif?
      representation_path(self)
    else
      procesesed = variant(
        resize_to_limit: [MAX_SIZE, MAX_SIZE],
        **VARIANT_PARAMS,
      )
      representation_path(procesesed)
    end
  end

  sig { returns(T.nilable(String)) }
  def srcset
    return if gif?

    sources = SIZES.map do |size|
      processed = variant(resize_to_limit: [size, size], **VARIANT_PARAMS)
      "#{representation_path(processed)} #{size}w"
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

  sig { returns(T::Boolean) }
  def gif?
    content_type&.start_with?("image/gif") || false
  end
end
