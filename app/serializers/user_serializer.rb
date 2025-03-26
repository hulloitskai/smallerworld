# typed: true
# frozen_string_literal: true

class UserSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :name, :handle, theme: { type: "UserTheme", nullable: true }

  # == Associations
  has_one :page_icon_blob, as: :page_icon, serializer: ImageSerializer
end
