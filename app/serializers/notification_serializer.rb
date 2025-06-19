# typed: true
# frozen_string_literal: true

class NotificationSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes created_at: { as: :timestamp },
             type: { type: "NotificationType" },
             payload: { type: "Record<string, any>" }
end
