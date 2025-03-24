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
             reply_snippet: { type: :string }

  # == Associations
  has_one :image_blob, as: :image, serializer: ImageSerializer, nullable: true
end
