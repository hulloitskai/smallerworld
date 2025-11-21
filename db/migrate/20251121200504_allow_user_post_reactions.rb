# typed: true
# frozen_string_literal: true

class AllowUserPostReactions < ActiveRecord::Migration[8.0]
  def change
    change_table :post_reactions do |t|
      t.remove_foreign_key column: :friend_id
      t.remove_index %i[post_id friend_id emoji],
                     unique: true,
                     name: "index_post_reactions_uniqueness"
      t.change_null :friend_id, true
      t.rename :friend_id, :deprecated_friend_id
      t.uuid :reactor_id
      t.string :reactor_type
      t.index %i[reactor_type reactor_id post_id emoji],
              name: "index_post_reactions_uniquness",
              unique: true
    end

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE post_reactions
          SET reactor_id = deprecated_friend_id, reactor_type = 'Friend'
          WHERE deprecated_friend_id IS NOT NULL;
        SQL
      end
      dir.down do
        execute <<~SQL.squish
          UPDATE post_reactions
          SET deprecated_friend_id = reactor_id
          WHERE reactor_id IS NOT NULL;
        SQL
      end
    end

    change_table :post_reactions do |t|
      t.change_null :reactor_id, false
      t.change_null :reactor_type, false
    end
  end
end
