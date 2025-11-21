# typed: true
# frozen_string_literal: true

class UniverseWorldProfileSerializer < WorldProfileSerializer
  # == Attributes ==

  attributes owner_id: { type: :string },
             uncleared_notification_count: { type: :number },
             last_post_created_at: { type: :string, nullable: true },
             associated_friend_access_token: { type: :string, nullable: true }

  # == Associations ==

  has_one :icon_image, as: :icon, serializer: ImageSerializer
end
