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
             :spotify_track_id,
             type: { type: "PostType" },
             visibility: { type: "PostVisibility" },
             snippet: { type: :string },
             reply_snippet: { type: :string }

  # == Associations
  has_many :ordered_images, as: :images, serializer: ImageSerializer
  has_one :quoted_post, serializer: QuotedPostSerializer, nullable: true
  has_one :encouragement,
          serializer: PostEncouragementSerializer,
          nullable: true
end
