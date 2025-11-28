# typed: true
# frozen_string_literal: true

class AuthorWorldProfileSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :world

  # == Attributes ==

  identifier
  attributes :handle
end
