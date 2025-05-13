# typed: true
# frozen_string_literal: true

class MaskedImageModel < ImageModel
  # == Methods
  sig { override.returns(String) }
  def src
    representation = representation(resize_to_limit: [32, 32])
    representation_path(representation)
  end

  sig { override.returns(T.nilable(String)) }
  def srcset = nil
end
