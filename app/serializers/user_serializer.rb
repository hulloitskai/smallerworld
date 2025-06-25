# typed: true
# frozen_string_literal: true

class UserSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :created_at,
             :name,
             :handle,
             theme: { type: "UserTheme", nullable: true },
             supported_features: { type: "Feature[]" }

  # == Associations
  has_one :serialized_page_icon, as: :page_icon, serializer: ImageSerializer
end
