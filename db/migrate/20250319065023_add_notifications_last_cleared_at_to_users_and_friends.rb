# typed: true
# frozen_string_literal: true

class AddNotificationsLastClearedAtToUsersAndFriends < ActiveRecord::Migration[8.0] # rubocop:disable Layout/LineLength
  def change
    change_table :users do |t|
      t.timestamptz :notifications_last_cleared_at, index: true
    end

    change_table :friends do |t|
      t.timestamptz :notifications_last_cleared_at, index: true
    end
  end
end
