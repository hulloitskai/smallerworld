# typed: true
# frozen_string_literal: true

class WorldSerializer < ApplicationSerializer
  # == Attributes
  attributes user_id: { type: :string },
             user_handle: { type: :string },
             user_name: { type: :string },
             post_count: { type: :number },
             last_post_created_at: { type: :string, nullable: true },
             associated_friend_access_token: { type: :string, nullable: true }

  # == Associations
  has_one :page_icon_blob, as: :page_icon, serializer: ImageSerializer
end
