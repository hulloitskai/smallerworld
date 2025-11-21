# typed: true
# frozen_string_literal: true

class WorldProfileSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :world

  # == Attributes ==

  identifier
  attributes :owner_id,
             :handle,
             :allow_friend_sharing,
             :hide_neko,
             name: { type: :string },
             theme: { type: "WorldTheme", nullable: true }

  attribute :owner_name, type: :string do
    owner = world.owner!
    owner.name
  end

  # == Associations ==

  has_one :icon_image, as: :icon, serializer: ImageSerializer
end
