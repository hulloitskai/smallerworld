# typed: true
# frozen_string_literal: true

class AddAllowFriendSharingToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :allow_friend_sharing, :boolean
    execute "UPDATE users SET allow_friend_sharing = false"
    change_column_null :users, :allow_friend_sharing, false
  end
end
