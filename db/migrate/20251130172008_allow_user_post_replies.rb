# typed: true
# frozen_string_literal: true

class AllowUserPostReplies < ActiveRecord::Migration[8.0]
  def change
    change_table :post_reply_receipts do |t|
      t.remove_foreign_key column: :friend_id
      t.change_null :friend_id, true
      t.rename :friend_id, :deprecated_friend_id
      t.uuid :replier_id
      t.string :replier_type
    end

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE post_reply_receipts
          SET replier_id = deprecated_friend_id, replier_type = 'Friend'
          WHERE deprecated_friend_id IS NOT NULL;
        SQL
      end
      dir.down do
        execute <<~SQL.squish
          UPDATE post_reactions
          SET deprecated_friend_id = replier_id
          WHERE replier_id IS NOT NULL;
        SQL
      end
    end

    change_table :post_reply_receipts do |t|
      t.change_null :replier_id, false
      t.change_null :replier_type, false
      t.index %i[replier_type replier_id],
              name: "index_post_reply_receipts_on_replier"
    end

    rename_index :post_reactions,
                 "index_post_reactions_uniquness",
                 "index_post_reactions_uniqueness"
    add_index :post_reactions,
              %i[reactor_type reactor_id],
              name: "index_post_reactions_on_reactor"
  end
end
