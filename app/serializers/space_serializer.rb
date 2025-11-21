# typed: true
# frozen_string_literal: true

class SpaceSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes :name, :description
end
