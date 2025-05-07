# typed: true
# frozen_string_literal: true

class QuotedPostSerializer < ApplicationSerializer
  # == Configuration
  object_as :post

  # == Attributes
  identifier
  attributes :created_at,
             :title,
             :body_html,
             :emoji,
             :pinned_until,
             type: { type: "PostType" }

  # == Associations
  has_many :images_blobs, as: :images, serializer: ImageSerializer
end
