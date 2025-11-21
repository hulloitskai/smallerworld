# typed: true
# frozen_string_literal: true

class UniverseWorldProfileSerializer < ApplicationSerializer
  # == Attributes ==

  attributes uncleared_notification_count: { type: :number },
             last_post_created_at: { type: :string, nullable: true },
             associated_friend_access_token: { type: :string, nullable: true }

  # == Associations ==

  flat_one :world, serializer: WorldProfileSerializer
end
