# typed: true
# frozen_string_literal: true

class PostNotificationPayloadAuthorSerializer < ApplicationSerializer
  # == Configuration
  object_as :user

  # == Attributes
  identifier
  attributes :name, :handle
end
