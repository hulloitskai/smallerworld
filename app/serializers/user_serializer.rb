# typed: true
# frozen_string_literal: true

class UserSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :created_at,
             :name,
             :handle,
             theme: { type: "UserTheme", nullable: true },
             active_features: { type: "Feature[]" }

  # == Associations
  has_one :page_icon_blob, as: :page_icon, serializer: ImageSerializer
end
