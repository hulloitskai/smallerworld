# typed: true
# frozen_string_literal: true

class AddUpdatedAtToPushRegistrations < ActiveRecord::Migration[8.0]
  def change
    add_column :push_registrations, :updated_at, :timestamptz
    execute "UPDATE push_registrations SET updated_at = created_at"
    change_column_null :push_registrations, :updated_at, false
  end
end
