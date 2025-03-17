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
end
