# typed: true
# frozen_string_literal: true

class AddPausedSinceToFriends < ActiveRecord::Migration[8.0]
  def change
    add_column :friends, :paused_since, :timestamptz
  end
end
