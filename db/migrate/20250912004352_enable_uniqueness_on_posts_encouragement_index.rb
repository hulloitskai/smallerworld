# typed: true
# frozen_string_literal: true

class EnableUniquenessOnPostsEncouragementIndex < ActiveRecord::Migration[8.0]
  def change
    up_only do
      execute <<~SQL.squish
        UPDATE posts
        SET encouragement_id = NULL
        WHERE id IN (
          SELECT p1.id
          FROM posts p1
          INNER JOIN posts p2 ON p1.encouragement_id = p2.encouragement_id
          WHERE p1.encouragement_id IS NOT NULL
            AND p1.id != p2.id
            AND p1.created_at > p2.created_at
        );
      SQL
    end
    change_table :posts do |t|
      t.remove_index :encouragement_id
      t.index :encouragement_id, unique: true
    end
  end
end
