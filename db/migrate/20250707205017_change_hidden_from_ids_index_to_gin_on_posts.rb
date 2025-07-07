# typed: true
# frozen_string_literal: true

class ChangeHiddenFromIdsIndexToGinOnPosts < ActiveRecord::Migration[8.0]
  def change
    # Remove the old B-tree index that's not being used for ANY queries
    remove_index :posts,
                 :hidden_from_ids,
                 name: "index_posts_on_hidden_from_ids"

    # Add a new GIN index that will be used for ANY queries on the array
    add_index :posts,
              :hidden_from_ids,
              using: :gin,
              name: "index_posts_on_hidden_from_ids"
  end
end
