# typed: true
# frozen_string_literal: true

class PostNotificationPayloadPostSerializer < ApplicationSerializer
  # == Configuration
  object_as :post

  # == Attributes
  identifier
  attributes :emoji,
             type: { type: "PostType" },
             title_snippet: { type: :string, nullable: true },
             body_snippet: { type: :string }
  attribute :image_src, type: :string, nullable: true do
    if (blob = post.image_blob)
      variant = blob.variant(resize_to_limit: [600, 400])
      rails_representation_path(variant)
    end
  end
  attribute :quoted_post_image_src, type: :string, nullable: true do
    if (quoted_post = post.quoted_post)
      if (blob = quoted_post.image_blob)
        rails_representation_path(blob.variant(resize_to_limit: [600, 400]))
      end
    end
  end
end
