# typed: true
# frozen_string_literal: true

class SpaceSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes :name,
             :description,
             :theme,
             :public,
             :owner_id,
             friendly_id: { type: :string }

  # == Associations ==

  has_one :icon_image, as: :icon, serializer: ImageSerializer, nullable: true
end
