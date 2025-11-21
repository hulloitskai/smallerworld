# typed: true
# frozen_string_literal: true

class UserProfileSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :user

  # == Attributes ==

  identifier
  attributes :name, supported_features: { type: "Feature[]" }
end
