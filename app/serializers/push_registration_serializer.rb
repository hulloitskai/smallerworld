# typed: true
# frozen_string_literal: true

class PushRegistrationSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :created_at,
             :device_id,
             :device_fingerprint,
             device_fingerprint_confidence: { type: :number }
end
