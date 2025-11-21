# typed: true
# frozen_string_literal: true

class AllowUserPostViewers < ActiveRecord::Migration[8.0]
  def change
    change_table :post_views do |t|
      t.remove_foreign_key column: :friend_id
      t.remove_index %i[friend_id post_id],
                     unique: true,
                     name: "index_post_views_uniqueness"
      t.change_null :friend_id, true
      t.rename :friend_id, :deprecated_friend_id
      t.uuid :viewer_id
      t.string :viewer_type
      t.index %i[viewer_type viewer_id post_id],
              unique: true,
              name: "index_post_views_uniqueness"
    end

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE post_views
          SET viewer_id = deprecated_friend_id, viewer_type = 'Friend'
          WHERE deprecated_friend_id IS NOT NULL;
        SQL
      end

      dir.down do
        execute <<~SQL.squish
          UPDATE post_views
          SET deprecated_friend_id = viewer_id
          WHERE viewer_id IS NOT NULL;
        SQL
      end
    end

    change_table :post_views do |t|
      t.change_null :viewer_id, false
      t.change_null :viewer_type, false
    end
  end
end
