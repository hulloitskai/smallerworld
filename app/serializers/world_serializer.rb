# typed: true
# frozen_string_literal: true

class WorldSerializer < WorldProfileSerializer
  # == Attributes ==

  identifier
  attributes :hide_stats,
             reply_to_number: { type: :string },
             search_enabled?: { as: :search_enabled, type: :boolean }

  # == Associations ==

  has_one :icon_image, as: :icon, serializer: ImageSerializer
end
