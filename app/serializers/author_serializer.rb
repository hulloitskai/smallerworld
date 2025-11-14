# typed: true
# frozen_string_literal: true

class AuthorSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :user

  # == Attributes ==

  identifier
  attributes :name, :handle

  # == Associations ==

  has_one :page_icon_image, as: :page_icon, serializer: ImageSerializer
end
