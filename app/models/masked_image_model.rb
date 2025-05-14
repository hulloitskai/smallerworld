# typed: true
# frozen_string_literal: true

class MaskedImageModel < ImageModel
  # == Constants
  MASKED_SIZE = 32

  # == Methods
  sig { override.returns(String) }
  def src
    variant = self.variant(resize_to_limit: [MASKED_SIZE, MASKED_SIZE])
    representation_path(variant)
  end

  sig { override.returns(T.nilable(String)) }
  def srcset = nil
end
