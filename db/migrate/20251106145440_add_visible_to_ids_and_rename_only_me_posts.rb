# typed: true
# frozen_string_literal: true

class AddVisibleToIdsAndRenameOnlyMePosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts,
               :visible_to_ids,
               :uuid,
               array: true,
               null: false,
               default: []
    add_index :posts,
              :visible_to_ids,
              using: :gin,
              name: "index_posts_on_visible_to_ids"

    up_only do
      execute <<~SQL.squish
        UPDATE posts
        SET visibility = 'secret'
        WHERE visibility = 'only_me'
      SQL
    end
  end
end
