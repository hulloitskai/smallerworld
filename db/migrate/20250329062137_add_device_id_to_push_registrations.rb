# typed: true
# frozen_string_literal: true

class AddDeviceIdToPushRegistrations < ActiveRecord::Migration[8.0]
  def change
    add_column :push_registrations, :device_id, :uuid
  end
end
