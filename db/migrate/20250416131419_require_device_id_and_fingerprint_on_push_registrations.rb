# typed: true
# frozen_string_literal: true

class RequireDeviceIdAndFingerprintOnPushRegistrations < ActiveRecord::Migration[8.0] # rubocop:disable Layout/LineLength
  def change
    up_only do
      execute <<~SQL.squish
        DELETE FROM push_registrations
        WHERE device_id IS NULL OR device_fingerprint IS NULL;
      SQL
    end

    change_table :push_registrations do |t|
      t.change_null :device_id, false
      t.change_null :device_fingerprint, false
    end
  end
end
