# typed: true
# frozen_string_literal: true

class RenameTokenToAccessTokenOnFriends < ActiveRecord::Migration[8.0]
  def change
    rename_column :friends, :token, :access_token
  end
end
