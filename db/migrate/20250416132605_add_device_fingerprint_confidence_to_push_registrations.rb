# typed: true
# frozen_string_literal: true

class AddDeviceFingerprintConfidenceToPushRegistrations < ActiveRecord::Migration[8.0] # rubocop:disable Layout/LineLength
  def change
    add_column :push_registrations, :device_fingerprint_confidence, :float4
    up_only do
      execute <<~SQL.squish
        UPDATE push_registrations
        SET device_fingerprint_confidence = 0.3
        WHERE device_fingerprint_confidence IS NULL;
      SQL
    end
    change_column_null :push_registrations,
                       :device_fingerprint_confidence,
                       false
  end
end
