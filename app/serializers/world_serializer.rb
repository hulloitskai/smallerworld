# typed: true
# frozen_string_literal: true

class WorldSerializer < ApplicationSerializer
  # == Configuration
  object_as :user

  # == Attributes
  identifier
  attributes :handle,
             name: :user_name,
             post_count: { type: :number },
             last_post_created_at: { type: :string, nullable: true }

  # == Associations
  has_one :page_icon_blob, as: :page_icon, serializer: ImageSerializer
end
