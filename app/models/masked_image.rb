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
class MaskedImage < Image
  # == Constants ==

  MASKED_SIZE = 32

  # == Methods ==

  sig { override.returns(String) }
  def src
    variant = self.variant(resize_to_limit: [MASKED_SIZE, MASKED_SIZE])
    representation_path(variant)
  end

  sig { override.returns(T.nilable(String)) }
  def srcset = nil
end
