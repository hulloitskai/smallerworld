# typed: true
# frozen_string_literal: true

class RemoveApiTokenFromUsers < ActiveRecord::Migration[8.0]
  def change
    remove_column :users, :api_token, :string
  end
end
