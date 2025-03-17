# typed: true
# frozen_string_literal: true

class CreatePostReactions < ActiveRecord::Migration[8.0]
  def change
    create_table :post_reactions, id: :uuid do |t|
      t.belongs_to :post, null: false, foreign_key: true, type: :uuid
      t.string :emoji, null: false
      t.belongs_to :friend, null: false, foreign_key: true, type: :uuid
      t.timestamptz :created_at, null: false

      t.index %i[post_id friend_id emoji],
              unique: true,
              name: "index_post_reactions_uniqueness"
    end
  end
end
