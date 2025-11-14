# typed: true
# frozen_string_literal: true

class UserProfileSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :user

  # == Attributes ==

  identifier
  attributes :name,
             :handle,
             theme: { type: "UserTheme", nullable: true },
             supported_features: { type: "Feature[]" }

  # == Associations ==

  has_one :page_icon_image, as: :page_icon, serializer: ImageSerializer
end
