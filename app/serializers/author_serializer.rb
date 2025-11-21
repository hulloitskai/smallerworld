# typed: true
# frozen_string_literal: true

class AuthorSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :user

  # == Attributes ==

  identifier
  attributes :name, :handle
end
