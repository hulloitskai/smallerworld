# typed: true
# frozen_string_literal: true

class AddTimeZoneToFriends < ActiveRecord::Migration[8.0]
  def change
    add_column :friends, :time_zone_name, :string
    execute <<~EOF
      UPDATE friends
      SET time_zone_name = users.time_zone_name
      FROM users
      WHERE friends.user_id = users.id
    EOF
    change_column_null :friends, :time_zone_name, false
  end
end
