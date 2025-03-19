# typed: true
# frozen_string_literal: true

class AddVisibilityToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :visibility, :string, null: false, default: "friends"
    add_index :posts, :visibility
    change_column_default :posts, :visibility, from: "friends", to: nil
  end
end
