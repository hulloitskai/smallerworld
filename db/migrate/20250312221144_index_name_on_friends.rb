# typed: true
# frozen_string_literal: true

class IndexNameOnFriends < ActiveRecord::Migration[8.0]
  def change
    add_index :friends,
              %i[name user_id],
              unique: true,
              name: "index_friends_uniqueness"
  end
end
