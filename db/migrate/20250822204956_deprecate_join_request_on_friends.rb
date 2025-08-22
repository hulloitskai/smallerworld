# typed: true
# frozen_string_literal: true

class DeprecateJoinRequestOnFriends < ActiveRecord::Migration[8.0]
  def change
    rename_column :friends, :join_request_id, :deprecated_join_request_id
  end
end
