# typed: true
# frozen_string_literal: true

class WorldProfileSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :world

  # == Attributes ==

  attributes id: { type: :string },
             owner_id: { type: :string },
             handle: { type: :string },
             allow_friend_sharing: { type: :boolean },
             hide_neko: { type: :boolean },
             name: { type: :string },
             theme: { type: "WorldTheme", nullable: true }

  attribute :owner_name, type: :string do
    owner = world.owner!
    owner.name
  end

  # == Associations ==

  has_one :icon_image, as: :icon, serializer: ImageSerializer
end
