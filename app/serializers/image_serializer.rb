# typed: true
# frozen_string_literal: true

class ImageSerializer < FileSerializer
  # == Configuration ==

  object_as :image

  # == Attributes ==

  attributes src: { type: :string },
             srcset: { type: :string, nullable: true },
             dimensions: { type: "Dimensions", nullable: true }
end
