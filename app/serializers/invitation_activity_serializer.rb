# typed: true
# frozen_string_literal: true

class InvitationActivitySerializer < ApplicationSerializer
  # == Configuration
  object_as :activity

  # == Attributes
  identifier
  attributes :name, :emoji
end
