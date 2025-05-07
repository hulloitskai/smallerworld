# typed: true
# frozen_string_literal: true

class PostSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :created_at,
             :title,
             :body_html,
             :emoji,
             :pinned_until,
             type: { type: "PostType" },
             visibility: { type: "PostVisibility" },
             snippet: { type: :string },
             reply_snippet: { type: :string }

  # == Associations
  has_many(
    :images_blobs,
    as: :images,
    serializer: ImageSerializer,
  ) do
    post.images_blobs.order(created_at: :asc)
  end
  has_one :quoted_post, serializer: QuotedPostSerializer, nullable: true
end
