# typed: true
# frozen_string_literal: true

class NotificationPostSerializer < ApplicationSerializer
  # == Configuration
  object_as :post

  # == Attributes
  identifier
  attributes :emoji,
             type: { type: "PostType" }

  attribute :title_snippet, type: :string, nullable: true do
    post.title&.strip&.truncate(92)
  end

  attribute :body_snippet, type: :string do
    post.body_text.strip.truncate(120)
  end

  attribute :cover_image_src, type: :string, nullable: true do
    if (blob = post.cover_image_blob || post.quoted_post&.cover_image_blob)
      variant = blob.variant(resize_to_limit: [600, 400])
      rails_representation_path(variant)
    end
  end
end
