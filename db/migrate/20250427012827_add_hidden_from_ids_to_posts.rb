# typed: true
# frozen_string_literal: true

class AddHiddenFromIdsToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts,
               :hidden_from_ids,
               :uuid,
               array: true,
               null: false,
               default: []
    add_index :posts, :hidden_from_ids
  end
end
