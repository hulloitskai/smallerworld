# typed: true
# frozen_string_literal: true

class LegacyNotificationSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes created_at: { as: :timestamp },
             delivery_token: { type: :string, nullable: true },
             legacy_type: { as: :type, type: "NotificationType" },
             legacy_payload: { as: :payload, type: "Record<string, any>" }
end
