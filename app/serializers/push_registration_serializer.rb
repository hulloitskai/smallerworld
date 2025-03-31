# typed: true
# frozen_string_literal: true

class PushRegistrationSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :device_id
end
