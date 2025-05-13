# typed: true
# frozen_string_literal: true

class ImageSerializer < FileSerializer
  # == Configuration
  object_as :image, model: "ImageModel"

  # == Attributes
  attributes src: { type: :string },
             srcset: { type: :string, nullable: true },
             dimensions: { type: "Dimensions", nullable: true }
end
