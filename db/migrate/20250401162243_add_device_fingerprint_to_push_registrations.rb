# typed: true
# frozen_string_literal: true

class AddDeviceFingerprintToPushRegistrations < ActiveRecord::Migration[8.0]
  def change
    add_column :push_registrations, :device_fingerprint, :string
    add_index :push_registrations, :device_id
    add_index :push_registrations, :device_fingerprint
  end
end
