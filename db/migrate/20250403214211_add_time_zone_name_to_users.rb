# typed: true
# frozen_string_literal: true

class AddTimeZoneNameToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :time_zone_name, :string
    execute "UPDATE users SET time_zone_name = 'America/Toronto'"
    change_column_null :users, :time_zone_name, false
  end
end
