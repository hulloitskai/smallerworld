# typed: true
# frozen_string_literal: true

class PushRegistrationSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes :created_at,
             :device_id,
             :device_fingerprint,
             service_worker_version: { type: :number, nullable: true },
             device_fingerprint_confidence: { type: :number }
end
