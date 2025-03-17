# typed: true
# frozen_string_literal: true

class RequireAccessTokenOnFriends < ActiveRecord::Migration[8.0]
  def change
    change_column_null :friends, :access_token, false
  end
end
