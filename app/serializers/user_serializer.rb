# typed: true
# frozen_string_literal: true

class UserSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :name, :handle

  # == Associations
  has_one :page_icon_blob, as: :page_icon, serializer: ImageSerializer
end
